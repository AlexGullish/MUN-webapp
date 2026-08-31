'use server';

import { prisma } from '../lib/prisma';
import { setSession, clearSession } from '../lib/session';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { parseDocxToHtml } from '../lib/docx';
import { getSession } from '../lib/session';

export interface FormState {
  error?: string;
  success?: boolean;
}

/**
 * Validates credentials and initializes cookie-based session
 */
export async function loginAction(prevState: FormState | null, formData: FormData): Promise<FormState> {
  const email = formData.get('email') as string;
  const loginCode = formData.get('loginCode') as string;
  
  if (!email || !loginCode) {
    return { error: 'Please enter both email and access code.' };
  }
  
  let user = null;
  try {
    user = await prisma.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        loginCode: loginCode.trim(),
      },
    });
  } catch (err) {
    console.error('Login database error:', err);
    return { error: 'An unexpected database error occurred.' };
  }
  
  if (!user) {
    return { error: 'Invalid email or access code. Please try again.' };
  }
  
  await setSession(user);
  
  // Dynamic redirect based on role
  let redirectUrl = '/dashboard';
  if (user.role === 'ADMIN') {
    redirectUrl = '/admin';
  } else if (user.role === 'CHAIR') {
    redirectUrl = '/chair';
  }
  
  redirect(redirectUrl);
}

/**
 * Destroys user session and redirects to login
 */
export async function logoutAction() {
  await clearSession();
  redirect('/login');
}

/**
 * Submits an amendment suggested by a delegate
 */
export async function submitAmendmentAction(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const session = await getSession();
  if (!session) {
    return { error: 'You must be logged in to submit an amendment.' };
  }
  
  const resolutionId = formData.get('resolutionId') as string;
  const text = formData.get('text') as string;
  const description = formData.get('description') as string;
  
  if (!resolutionId || !text) {
    return { error: 'Amendment text is required.' };
  }
  
  try {
    // 1. Fetch resolution
    const resolution = await prisma.resolution.findUnique({
      where: { id: resolutionId },
    });
    
    if (!resolution) {
      return { error: 'Resolution not found.' };
    }
    
    // 2. Fetch user details to verify role and committee
    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });
    
    if (!user) {
      return { error: 'User profile not found.' };
    }
    
    // 3. Delegate-specific restriction validation: must belong to the committee
    if (user.role === 'DELEGATE' && user.committeeId !== resolution.committeeId) {
      return { error: 'Unauthorized: You can only submit amendments to resolutions within your own committee.' };
    }
    
    // 4. Create amendment
    await prisma.amendment.create({
      data: {
        resolutionId,
        userId: user.id,
        text: text.trim(),
        description: description?.trim() || null,
        status: 'PENDING',
      },
    });
    
    revalidatePath(`/resolution/${resolutionId}`);
    return { success: true };
  } catch (err) {
    console.error('Amendment creation error:', err);
    return { error: 'Failed to submit amendment due to database error.' };
  }
}

/**
 * Uploads a new resolution or edits an existing resolution metadata/docx.
 */
export async function uploadResolutionAction(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const session = await getSession();
  if (!session || !['CHAIR', 'ADMIN'].includes(session.role)) {
    return { error: 'Unauthorized: Only Committee Chairs and Admins can upload resolutions.' };
  }
  
  const title = formData.get('title') as string;
  const topic = formData.get('topic') as string;
  const country = formData.get('country') as string;
  const status = (formData.get('status') as string) || 'DRAFT';
  const docxFile = formData.get('docxFile') as File;
  const resolutionId = formData.get('resolutionId') as string; // Optional (for editing/overwriting)
  
  if (!title || !topic || !country) {
    return { error: 'Please fill in all resolution fields (Title, Topic, Sponsor Country).' };
  }
  
  try {
    // Determine the committee
    let committeeId = '';
    
    if (session.role === 'CHAIR') {
      const chair = await prisma.user.findUnique({
        where: { id: session.id },
      });
      if (!chair || !chair.committeeId) {
        return { error: 'You are not assigned to any committee.' };
      }
      committeeId = chair.committeeId;
    } else {
      committeeId = formData.get('committeeId') as string;
      if (!committeeId) {
        return { error: 'Please select a committee.' };
      }
    }
    
    let renderedHtml = '';
    
    // Parse DOCX if a new file is uploaded
    if (docxFile && docxFile.size > 0) {
      const bytes = await docxFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      renderedHtml = await parseDocxToHtml(buffer);
    } else if (!resolutionId) {
      return { error: 'A DOCX resolution file is required for new uploads.' };
    }
    
    if (resolutionId) {
      const updateData: Record<string, unknown> = {
        title: title.trim(),
        topic: topic.trim(),
        country: country.trim(),
        status,
      };
      
      if (renderedHtml) {
        updateData.renderedHtml = renderedHtml;
        updateData.originalDocxPath = docxFile.name;
      }
      
      await prisma.resolution.update({
        where: { id: resolutionId },
        data: updateData,
      });
      
      revalidatePath(`/resolution/${resolutionId}`);
    } else {
      await prisma.resolution.create({
        data: {
          title: title.trim(),
          topic: topic.trim(),
          country: country.trim(),
          committeeId,
          renderedHtml,
          originalDocxPath: docxFile.name,
          status,
          uploadedById: session.id,
        },
      });
    }
    
    revalidatePath(session.role === 'CHAIR' ? '/chair' : '/admin');
    revalidatePath('/resolutions');
    return { success: true };
  } catch (err: unknown) {
    console.error('Resolution upload database error:', err);
    return { error: err instanceof Error ? err.message : 'Failed to upload/update resolution due to error.' };
  }
}

/**
 * Updates an amendment status (APPROVED or REJECTED)
 */
export async function updateAmendmentStatusAction(
  amendmentId: string,
  status: 'APPROVED' | 'REJECTED'
) {
  const session = await getSession();
  if (!session || !['CHAIR', 'ADMIN'].includes(session.role)) {
    throw new Error('Unauthorized');
  }
  
  try {
    const amendment = await prisma.amendment.findUnique({
      where: { id: amendmentId },
      include: { resolution: true },
    });
    
    if (!amendment) throw new Error('Amendment not found');
    
    if (session.role === 'CHAIR' && session.committeeId !== amendment.resolution.committeeId) {
      throw new Error('Unauthorized to review this committee\'s amendments');
    }
    
    await prisma.amendment.update({
      where: { id: amendmentId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedById: session.id,
      },
    });
    
    revalidatePath(`/resolution/${amendment.resolutionId}`);
    revalidatePath(session.role === 'CHAIR' ? '/chair' : '/admin');
  } catch (err) {
    console.error('Update amendment status error:', err);
    throw err;
  }
}

/**
 * Deletes a resolution
 */
export async function deleteResolutionAction(id: string) {
  const session = await getSession();
  if (!session || !['CHAIR', 'ADMIN'].includes(session.role)) {
    throw new Error('Unauthorized');
  }
  
  try {
    const resolution = await prisma.resolution.findUnique({
      where: { id },
    });
    
    if (!resolution) throw new Error('Resolution not found');
    
    if (session.role === 'CHAIR' && session.committeeId !== resolution.committeeId) {
      throw new Error('Unauthorized to delete this resolution');
    }
    
    await prisma.resolution.delete({
      where: { id },
    });
    
    revalidatePath('/resolutions');
    revalidatePath(session.role === 'CHAIR' ? '/chair' : '/admin');
  } catch (err) {
    console.error('Delete resolution error:', err);
    throw err;
  }
}

/**
 * Helper to generate secure random access code (e.g. MUN-X843-H129)
 */
function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, 0, I, 1 to prevent user confusion
  const part = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `MUN-${part()}-${part()}`;
}

/**
 * Create or update a user account (Admin function)
 */
export async function createOrUpdateUserAction(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return { error: 'Unauthorized: Only Administrators can modify users.' };
  }
  
  const id = formData.get('userId') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as string;
  const school = formData.get('school') as string;
  const country = formData.get('country') as string;
  const allergies = formData.get('allergies') as string;
  const committeeId = formData.get('committeeId') as string;
  const customLoginCode = formData.get('loginCode') as string;
  
  if (!name || !email || !role || !school || !country) {
    return { error: 'All core user fields are required.' };
  }
  
  try {
    if (id) {
      await prisma.user.update({
        where: { id },
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          school: school.trim(),
          country: country.trim(),
          allergies: allergies?.trim() || null,
          committeeId: committeeId || null,
          loginCode: customLoginCode ? customLoginCode.trim() : undefined,
        },
      });
    } else {
      const generatedCode = customLoginCode ? customLoginCode.trim() : generateAccessCode();
      
      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email.trim().toLowerCase() },
            { loginCode: generatedCode }
          ]
        }
      });
      
      if (existing) {
        return { error: 'A user with this email or access code already exists.' };
      }
      
      await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          school: school.trim(),
          country: country.trim(),
          allergies: allergies?.trim() || null,
          committeeId: committeeId || null,
          loginCode: generatedCode,
        },
      });
    }
    
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    console.error('User CRUD error:', err);
    return { error: err instanceof Error ? err.message : 'Database error occurred while saving user.' };
  }
}

/**
 * Deletes a user account (Admin function)
 */
export async function deleteUserAction(id: string) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');
  
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath('/admin');
  } catch (err) {
    console.error('Delete user error:', err);
    throw err;
  }
}

/**
 * Creates or updates a committee (Admin function)
 */
export async function createOrUpdateCommitteeAction(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return { error: 'Unauthorized' };
  }
  
  const id = formData.get('committeeId') as string;
  const name = formData.get('name') as string;
  const roomNumber = formData.get('roomNumber') as string;
  const chairUserId = formData.get('chairUserId') as string;
  
  if (!name || !roomNumber) {
    return { error: 'Committee Name and Room Number are required.' };
  }
  
  try {
    if (id) {
      await prisma.committee.update({
        where: { id },
        data: {
          name: name.trim(),
          roomNumber: roomNumber.trim(),
          chairUserId: chairUserId || null,
        },
      });
    } else {
      await prisma.committee.create({
        data: {
          name: name.trim(),
          roomNumber: roomNumber.trim(),
          chairUserId: chairUserId || null,
        },
      });
    }
    
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    console.error('Committee CRUD error:', err);
    return { error: err instanceof Error ? err.message : 'Database error occurred while saving committee.' };
  }
}

/**
 * Deletes a committee (Admin function)
 */
export async function deleteCommitteeAction(id: string) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');
  
  try {
    await prisma.committee.delete({
      where: { id },
    });
    revalidatePath('/admin');
  } catch (err) {
    console.error('Delete committee error:', err);
    throw err;
  }
}

export interface ImportResult {
  error?: string;
  success?: boolean;
  importedCount?: number;
  committeesCreated?: number;
}

/**
 * Parses and processes CSV import of users, creating accounts and auto-generating access codes.
 */
export async function importCsvAction(prevState: ImportResult | null, formData: FormData): Promise<ImportResult> {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return { error: 'Unauthorized: Only Administrators can import bulk data.' };
  }
  
  const csvFile = formData.get('csvFile') as File;
  if (!csvFile || csvFile.size === 0) {
    return { error: 'Please upload a valid CSV file.' };
  }
  
  try {
    const text = await csvFile.text();
    
    const lines = text.split(/\r?\n/);
    if (lines.length <= 1) {
      return { error: 'CSV file is empty or only contains header.' };
    }
    
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    
    const idxName = headers.indexOf('name');
    const idxEmail = headers.indexOf('email');
    const idxSchool = headers.indexOf('school');
    const idxCountry = headers.indexOf('country');
    const idxCommittee = headers.indexOf('committee');
    const idxAllergies = headers.indexOf('allergies');
    const idxRole = headers.indexOf('role');
    
    if (idxName === -1 || idxEmail === -1 || idxRole === -1) {
      return { error: 'CSV must contain at least "name", "email", and "role" columns.' };
    }
    
    let importedCount = 0;
    let committeesCreated = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const fields: string[] = [];
      let currentField = '';
      let insideQuotes = false;
      
      for (let charIdx = 0; charIdx < line.length; charIdx++) {
        const char = line[charIdx];
        if (char === '"' || char === "'") {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          fields.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      fields.push(currentField.trim());
      
      const name = fields[idxName];
      const email = fields[idxEmail]?.toLowerCase();
      const role = fields[idxRole]?.toUpperCase() || 'DELEGATE';
      const school = idxSchool !== -1 ? fields[idxSchool] : 'Unknown';
      const country = idxCountry !== -1 ? fields[idxCountry] : 'Observer';
      const committeeName = idxCommittee !== -1 ? fields[idxCommittee] : '';
      const allergies = idxAllergies !== -1 ? fields[idxAllergies] : null;
      
      if (!name || !email) continue;
      
      let committeeId = null;
      if (committeeName) {
        let committee = await prisma.committee.findFirst({
          where: { name: committeeName },
        });
        
        if (!committee) {
          committee = await prisma.committee.create({
            data: {
              name: committeeName,
              roomNumber: `TBD-${Math.floor(100 + Math.random() * 900)}`,
            },
          });
          committeesCreated++;
        }
        committeeId = committee.id;
      }
      
      const loginCode = generateAccessCode();
      
      const existing = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existing) continue;
      
      await prisma.user.create({
        data: {
          name,
          email,
          role,
          school,
          country,
          allergies: allergies || null,
          committeeId,
          loginCode,
        },
      });
      
      importedCount++;
    }
    
    revalidatePath('/admin');
    return { success: true, importedCount, committeesCreated };
  } catch (err: unknown) {
    console.error('CSV import error:', err);
    return { error: err instanceof Error ? err.message : 'An error occurred while parsing and importing CSV.' };
  }
}
