'use client';

import React, { useState } from 'react';

interface InteractiveMapProps {
  roomNumber?: string | null;
  uploadedMapPath?: string | null;
}

export default function InteractiveMap({ roomNumber, uploadedMapPath }: InteractiveMapProps) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(roomNumber || null);

  if (uploadedMapPath) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <img
          src={uploadedMapPath}
          alt="School Conference Map"
          style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 'var(--radius-md)' }}
        />
        <div style={{ fontSize: '0.8rem', color: 'var(--color-neutral-600)', textAlign: 'center' }}>
          Showing uploaded floor plan. Highlighted room: <strong>{roomNumber}</strong>
        </div>
      </div>
    );
  }

  const rooms = [
    { id: 'Room 101', name: 'Security Council (Room 101)', x: 50, y: 50, w: 140, h: 90 },
    { id: 'Room 102', name: 'WHO (Room 102)', x: 210, y: 50, w: 140, h: 90 },
    { id: 'Room 103', name: 'DISEC (Room 103)', x: 50, y: 160, w: 140, h: 90 },
    { id: 'Lobby', name: 'Conference Lobby / Reception', x: 210, y: 160, w: 260, h: 90 },
    { id: 'Room 104', name: 'Secretariat (Room 104)', x: 410, y: 50, w: 60, h: 90 },
  ];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <svg
        viewBox="0 0 520 300"
        width="100%"
        height="100%"
        style={{
          border: '1px solid var(--color-neutral-200)',
          borderRadius: 'var(--radius-md)',
          background: '#ffffff'
        }}
      >
        <rect width="100%" height="100%" fill="var(--color-neutral-50)" />

        <rect x="30" y="30" width="460" height="240" fill="none" stroke="var(--color-neutral-300)" strokeWidth="1.5" rx="6" />

        {rooms.map((room) => {
          const isUserRoom = room.id === roomNumber;
          const isSelected = room.id === selectedRoom;

          return (
            <g
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={room.x}
                y={room.y}
                width={room.w}
                height={room.h}
                fill={isSelected ? (isUserRoom ? 'var(--color-primary-light)' : 'var(--color-neutral-100)') : 'var(--color-neutral-50)'}
                stroke={isUserRoom ? 'var(--color-primary)' : (isSelected ? 'var(--color-neutral-600)' : 'var(--color-neutral-300)')}
                strokeWidth={isUserRoom || isSelected ? 1.5 : 1}
                strokeDasharray={room.id === 'Lobby' ? '4 4' : 'none'}
                rx="6"
              />

              <text
                x={room.x + room.w / 2}
                y={room.y + room.h / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isUserRoom ? 'var(--color-primary)' : (isSelected ? 'var(--color-neutral-800)' : 'var(--color-neutral-600)')}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: isUserRoom || isSelected ? '600' : '500',
                  fontSize: room.id === 'Lobby' ? '0.75rem' : '0.78rem',
                  userSelect: 'none',
                  pointerEvents: 'none'
                }}
              >
                {room.id === 'Lobby' ? 'LOBBY' : room.id}
              </text>

              {isUserRoom && (
                <rect
                  x={room.x + room.w - 14}
                  y={room.y + room.h - 14}
                  width="8"
                  height="8"
                  rx="2"
                  fill="var(--color-primary)"
                />
              )}
            </g>
          );
        })}
      </svg>

      <div
        className="card"
        style={{
          padding: '0.75rem 1rem',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <span style={{ color: 'var(--color-neutral-500)' }}>Selected: </span>
          <strong style={{ color: selectedRoom === roomNumber ? 'var(--color-primary)' : 'var(--color-neutral-900)' }}>
            {rooms.find(r => r.id === selectedRoom)?.name || 'None'}
          </strong>
          {selectedRoom === roomNumber && (
            <span
              className="badge"
              style={{
                marginLeft: '0.5rem',
                fontSize: '0.65rem',
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)'
              }}
            >
              Your Room
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>Click to select</span>
      </div>
    </div>
  );
}
