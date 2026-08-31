import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing existing database tables...');
  await prisma.amendment.deleteMany({});
  await prisma.resolution.deleteMany({});
  await prisma.committee.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding administrative and staff accounts...');
  
  // 1. Create Admin
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _admin = await prisma.user.create({
    data: {
      name: 'Secretariat Admin',
      email: 'admin@mun.org',
      loginCode: 'MUN-ADMIN-2026',
      school: 'MUN Secretariat',
      country: 'Secretariat',
      role: 'ADMIN',
      allergies: 'None',
    },
  });

  // 2. Create Chairs
  const chairSC = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah.j@mun.org',
      loginCode: 'MUN-CHAIR-SC',
      school: 'Oxford Academy',
      country: 'United Kingdom',
      role: 'CHAIR',
    },
  });

  const chairWHO = await prisma.user.create({
    data: {
      name: 'David Patel',
      email: 'david.p@mun.org',
      loginCode: 'MUN-CHAIR-WHO',
      school: 'Cambridge High',
      country: 'India',
      role: 'CHAIR',
    },
  });

  const chairDISEC = await prisma.user.create({
    data: {
      name: 'Chloe Dupont',
      email: 'chloe.d@mun.org',
      loginCode: 'MUN-CHAIR-DISEC',
      school: 'Paris Lycée',
      country: 'France',
      role: 'CHAIR',
    },
  });

  console.log('Seeding committees...');
  
  // 3. Create Committees and map Chairs
  const committeeSC = await prisma.committee.create({
    data: {
      name: 'Security Council',
      roomNumber: 'Room 101',
      chairUserId: chairSC.id,
    },
  });

  const committeeWHO = await prisma.committee.create({
    data: {
      name: 'World Health Organization (WHO)',
      roomNumber: 'Room 102',
      chairUserId: chairWHO.id,
    },
  });

  const committeeDISEC = await prisma.committee.create({
    data: {
      name: 'Disarmament & International Security (DISEC)',
      roomNumber: 'Room 103',
      chairUserId: chairDISEC.id,
    },
  });

  // Link Chairs to their Committees
  await prisma.user.update({
    where: { id: chairSC.id },
    data: { committeeId: committeeSC.id },
  });
  await prisma.user.update({
    where: { id: chairWHO.id },
    data: { committeeId: committeeWHO.id },
  });
  await prisma.user.update({
    where: { id: chairDISEC.id },
    data: { committeeId: committeeDISEC.id },
  });

  console.log('Seeding delegates...');
  
  // 4. Create Delegates
  const delUS = await prisma.user.create({
    data: {
      name: 'Alex Carter',
      email: 'alex.c@mun.org',
      loginCode: 'MUN-DEL-SC-USA',
      school: 'Boston Prep',
      country: 'USA',
      role: 'DELEGATE',
      committeeId: committeeSC.id,
    },
  });

  const delKorea = await prisma.user.create({
    data: {
      name: 'Min-Jun Kim',
      email: 'minjun.k@mun.org',
      loginCode: 'MUN-DEL-SC-KOREA',
      school: 'Seoul Global',
      country: 'South Korea',
      role: 'DELEGATE',
      committeeId: committeeSC.id,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _delRussia = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena.r@mun.org',
      loginCode: 'MUN-DEL-WHO-RUSSIA',
      school: 'Moscow Gym',
      country: 'Russia',
      role: 'DELEGATE',
      committeeId: committeeWHO.id,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _delEgypt = await prisma.user.create({
    data: {
      name: 'Salim Al-Jamil',
      email: 'salim.j@mun.org',
      loginCode: 'MUN-DEL-DISEC-EGYPT',
      school: 'Cairo Prep',
      country: 'Egypt',
      role: 'DELEGATE',
      committeeId: committeeDISEC.id,
    },
  });

  console.log('Seeding resolutions...');

  // 5. Create Resolutions
  const htmlSC = `
    <div class="resolution-content">
      <h2>Resolution SC/2026/241</h2>
      <p><strong>Committee:</strong> Security Council</p>
      <p><strong>Topic:</strong> De-escalation of border tensions in East Africa</p>
      <p><strong>Sponsor:</strong> United States of America</p>
      
      <hr />
      
      <h3>Preambulatory Clauses</h3>
      <p><em>The Security Council,</em></p>
      <p><u>Alarmed</u> by the sudden escalation of border conflicts and troop deployments in the East African region,</p>
      <p><u>Deeply concerned</u> for the safety, welfare, and human rights of civilian populations displaced by active hostilities,</p>
      <p><u>Recalling</u> its previous resolutions on regional security, peacekeeping mandates, and cooperative border defense mechanisms,</p>
      
      <h3>Operative Clauses</h3>
      <ol>
        <li><u>Demands</u> an immediate, unconditional ceasefire of all military actions and bilateral troop movements along the disputed borders;</li>
        <li><u>Calls upon</u> neighboring states to establish a demilitarized buffer zone extending fifteen (15) kilometers on either side of the internationally recognized border lines;</li>
        <li><u>Urges</u> the immediate deployment of an international joint observer mission to monitor compliance and report weekly violations directly to the Secretariat;</li>
        <li><u>Decides</u> to remain actively seized of the matter.</li>
      </ol>
    </div>
  `;

  const htmlWHO = `
    <div class="resolution-content">
      <h2>Resolution WHO/2026/109</h2>
      <p><strong>Committee:</strong> World Health Organization</p>
      <p><strong>Topic:</strong> Standardizing pandemic response protocols in developing nations</p>
      <p><strong>Sponsor:</strong> Russian Federation</p>
      
      <hr />
      
      <h3>Preambulatory Clauses</h3>
      <p><em>The World Health Organization,</em></p>
      <p><u>Recognizing</u> that disparities in medical infrastructure, logistical chains, and vaccine storage facilities severely hinder global threat management,</p>
      <p><u>Affirming</u> the absolute necessity of open scientific collaboration and technology transfer during health emergencies,</p>
      
      <h3>Operative Clauses</h3>
      <ol>
        <li><u>Recommends</u> the establishment of a standardized global pandemic toolkit containing logistics protocols, mobile cooling units, and basic antiviral medications;</li>
        <li><u>Encourages</u> high-income member states to subsidize local vaccine manufacturing centers in developing regions;</li>
        <li><u>Requests</u> a bi-annual review of preparedness indexes across all sub-Saharan and South-Asian delegations.</li>
      </ol>
    </div>
  `;

  const res1 = await prisma.resolution.create({
    data: {
      title: 'Resolution SC/2026/241',
      topic: 'De-escalation of border tensions in East Africa',
      country: 'USA',
      committeeId: committeeSC.id,
      renderedHtml: htmlSC,
      status: 'PUBLISHED',
      uploadedById: chairSC.id,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _res2 = await prisma.resolution.create({
    data: {
      title: 'Resolution WHO/2026/109',
      topic: 'Standardizing pandemic response protocols in developing nations',
      country: 'Russia',
      committeeId: committeeWHO.id,
      renderedHtml: htmlWHO,
      status: 'DRAFT',
      uploadedById: chairWHO.id,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _res3 = await prisma.resolution.create({
    data: {
      title: 'Resolution DISEC/2026/052',
      topic: 'Regulating artificial intelligence in autonomous weapons systems',
      country: 'Egypt',
      committeeId: committeeDISEC.id,
      renderedHtml: `
        <div class="resolution-content">
          <h2>Resolution DISEC/2026/052</h2>
          <p><strong>Committee:</strong> DISEC</p>
          <p><strong>Topic:</strong> Regulating AI in autonomous weapons</p>
          <p><strong>Sponsor:</strong> Egypt</p>
          <hr />
          <p>Draft resolution details regulating remote military AI applications, targeting parameters, and human oversight locks.</p>
        </div>
      `,
      status: 'SUBMITTED',
      uploadedById: chairDISEC.id,
    },
  });

  console.log('Seeding amendments...');
  
  // 6. Create Amendments
  await prisma.amendment.create({
    data: {
      resolutionId: res1.id,
      userId: delUS.id,
      text: 'Add Operative Clause 3b: "Urges all regional partners to contribute financial aid and humanitarian supplies to the UN refugee agency (UNHCR)."',
      description: 'Ensures refugees displaced by the conflict are properly supported.',
      status: 'PENDING',
    },
  });

  await prisma.amendment.create({
    data: {
      resolutionId: res1.id,
      userId: delKorea.id,
      text: 'Replace "fifteen (15) kilometers" in Operative Clause 2 with "ten (10) kilometers to allow local agricultural farming to resume safely."',
      description: 'Allows farming families along the border to maintain their livelihoods.',
      status: 'APPROVED',
      reviewedAt: new Date(),
      reviewedById: chairSC.id,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Done seeding
  });
