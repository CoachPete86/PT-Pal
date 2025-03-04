import React from "react";

// Define the expected plan interface based on your template blueprint
export interface SessionPlan {
  sessionDetails: {
    sessionType: string;
    clientName: string;
    coach: string;
    duration: string; // e.g., "45 Minutes"
    location: string;
    date?: string;
  };
  equipmentNeeded: {
    equipmentList: string[]; // main equipment list
    other?: string;
  };
  warmup: {
    explanation: string;
    exercises: Array<{
      exercise: string;
      durationOrReps: string;
      notes: string;
    }>;
  };
  mainWorkout: Array<{
    blockTitle: string; // e.g., "WORKOUT BLOCK 1"
    format: string;     // e.g., "3 rounds, 40 sec work/20 sec rest..."
    explanation: string;
    exercises: Array<{
      exercise: string;
      repsOrTime: string;
      notes: string;
    }>;
  }>;
  extraWork?: {
    explanation: string;
    exercises: Array<{
      exercise: string;
      sets: string;
      reps: string;
      notes: string;
    }>;
  };
  cooldown: {
    explanation: string;
    exercises: Array<{
      exercise: string;
      duration: string;
      notes: string;
    }>;
  };
  machineSetupGuide: {
    explanation: string;
    machines: Array<{
      machine: string;
      setupInstructions: string;
    }>;
  };
  closingMessage: string;
  progressNotes: string[];
  nextSessionPreparation: string[];
}

interface SessionPlanTemplateProps {
  plan: SessionPlan;
  onExportPdf?: () => void;
  onExportNotion?: () => void;
}

const SessionPlanTemplate: React.FC<SessionPlanTemplateProps> = ({ 
  plan, 
  onExportPdf,
  onExportNotion
}) => {
  const {
    sessionDetails,
    equipmentNeeded,
    warmup,
    mainWorkout,
    extraWork,
    cooldown,
    machineSetupGuide,
    closingMessage,
    progressNotes,
    nextSessionPreparation,
  } = plan;

  return (
    <div className="p-6 font-sans">
      {/* Action buttons */}
      <div className="flex justify-end gap-4 mb-4">
        {onExportPdf && (
          <button 
            onClick={onExportPdf}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
              <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
              <path d="M9 17h6"></path>
              <path d="M9 13h6"></path>
            </svg>
            Export as PDF
          </button>
        )}
        
        {onExportNotion && (
          <button 
            onClick={onExportNotion}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466z M5.819 8.035c.187.475.747.42 1.12.42l11.44-.84c.14-.047.233-.233.186-.42l-.746-1.914c-.14-.28-.42-.42-.7-.326l-11.52.886c-.14.047-.187.186-.14.326zm-1.12 3.22c.28.42.747.327 1.168.327l12.513-.886c.233-.047.327-.233.28-.466l-.513-1.68c-.094-.233-.32-.326-.654-.28l-12.32.886c-.28.047-.374.14-.327.373zm10.452 8.245c.42-.046.84-.233 1.026-.513.233-.326.233-.7.233-.98l-.046-7.665c0-.233-.14-.42-.42-.42-.233 0-.327.187-.327.42l.046 7.345c0 .233-.046.42-.186.56-.14.14-.327.187-.513.187l-7.99.567c-.233 0-.327-.187-.327-.42v-7.345c0-.233-.14-.42-.373-.42-.233 0-.327.187-.327.42l.047 7.665c0 .28.093.606.326.793.14.14.42.233.7.233z"></path>
            </svg>
            Export to Notion
          </button>
        )}
      </div>

      {/* Header */}
      <h1 className="text-3xl font-bold mb-4">🏋️‍♂️ Session Plan</h1>

      {/* Session Plan Details */}
      <section className="mb-6 border-b pb-4">
        <h2 className="text-xl font-bold mb-2">📋 Session Plan Details</h2>
        <p>
          <strong>🎯 Session Type:</strong> {sessionDetails.sessionType}
        </p>
        <p>
          <strong>👤 Client Name:</strong> {sessionDetails.clientName}
        </p>
        <p>
          <strong>👨‍🏫 Coach:</strong> {sessionDetails.coach}
        </p>
        <p>
          <strong>⏱ Duration:</strong> {sessionDetails.duration}
        </p>
        <p>
          <strong>📍 Location:</strong> {sessionDetails.location}
        </p>
        {sessionDetails.date && (
          <p>
            <strong>📅 Date:</strong> {sessionDetails.date}
          </p>
        )}
      </section>

      {/* Equipment Needed */}
      <section className="mb-6 border-b pb-4">
        <h2 className="text-xl font-bold mb-2">🎒 Equipment Needed</h2>
        <ul className="list-disc ml-6 mb-2">
          {equipmentNeeded.equipmentList.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
        {equipmentNeeded.other && (
          <p>
            <strong>Other:</strong> {equipmentNeeded.other}
          </p>
        )}
      </section>

      {/* Warm-Up */}
      <section className="mb-6 border-b pb-4">
        <h2 className="text-xl font-bold mb-2">🌅 1. Mobility & Warm-Up (10-12 mins)</h2>
        <p className="mb-2">
          <strong>Purpose:</strong> {warmup.explanation}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse mb-2">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-2">Exercise</th>
                <th className="text-left p-2">Duration/Reps</th>
                <th className="text-left p-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {warmup.exercises.map((ex, idx) => (
                <tr key={idx} className="border-b hover:bg-muted/20">
                  <td className="p-2">{ex.exercise}</td>
                  <td className="p-2">{ex.durationOrReps}</td>
                  <td className="p-2">{ex.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* The Workout */}
      <section className="mb-6 border-b pb-4">
        <h2 className="text-xl font-bold mb-2">💪 2. THE WORKOUT</h2>
        
        {mainWorkout.map((block, idx) => (
          <div key={idx} className="mb-6 border p-4 rounded-lg">
            <h3 className="font-semibold text-lg">{block.blockTitle}</h3>
            <p className="mb-1">
              <strong>Format:</strong> {block.format}
            </p>
            <p className="mb-4">
              <strong>Explanation:</strong> {block.explanation}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2">Exercise</th>
                    <th className="text-left p-2">Reps/Time</th>
                    <th className="text-left p-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {block.exercises.map((ex, i) => (
                    <tr key={i} className="border-b hover:bg-muted/20">
                      <td className="p-2">{ex.exercise}</td>
                      <td className="p-2">{ex.repsOrTime}</td>
                      <td className="p-2">{ex.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      {/* Extra Work */}
      {extraWork && extraWork.exercises.length > 0 && (
        <section className="mb-6 border-b pb-4">
          <h2 className="text-xl font-bold mb-2">🎯 3. Extra Work (Optional)</h2>
          <p className="mb-4">
            {extraWork.explanation}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-2">Exercise</th>
                  <th className="text-left p-2">Sets</th>
                  <th className="text-left p-2">Reps</th>
                  <th className="text-left p-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {extraWork.exercises.map((ex, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/20">
                    <td className="p-2">{ex.exercise}</td>
                    <td className="p-2">{ex.sets}</td>
                    <td className="p-2">{ex.reps}</td>
                    <td className="p-2">{ex.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Cool-Down & Mobility */}
      <section className="mb-6 border-b pb-4">
        <h2 className="text-xl font-bold mb-2">🧘 4. Cool-Down & Mobility (5-10 mins)</h2>
        <p className="mb-4">
          <strong>Purpose:</strong> {cooldown.explanation}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-2">Exercise</th>
                <th className="text-left p-2">Duration</th>
                <th className="text-left p-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {cooldown.exercises.map((ex, idx) => (
                <tr key={idx} className="border-b hover:bg-muted/20">
                  <td className="p-2">{ex.exercise}</td>
                  <td className="p-2">{ex.duration}</td>
                  <td className="p-2">{ex.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Machine Setup Guide */}
      <section className="mb-6 border-b pb-4">
        <h2 className="text-xl font-bold mb-2">⚙ 5. Machine Setup Guide</h2>
        <p className="mb-4">
          <strong>Explanation:</strong> {machineSetupGuide.explanation}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-2">Machine/Equipment</th>
                <th className="text-left p-2">Setup Instructions</th>
              </tr>
            </thead>
            <tbody>
              {machineSetupGuide.machines.map((m, idx) => (
                <tr key={idx} className="border-b hover:bg-muted/20">
                  <td className="p-2">{m.machine}</td>
                  <td className="p-2">{m.setupInstructions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Closing Message */}
      <section className="mb-6 border-b pb-4">
        <h2 className="text-xl font-bold mb-2">📝 6. Closing Message</h2>
        <p className="p-2 border rounded-md bg-muted/20">{closingMessage}</p>
      </section>

      {/* Progress Notes */}
      <section className="mb-6 border-b pb-4">
        <h3 className="text-lg font-bold mb-2">🎯 Progress Notes (For Next Session)</h3>
        <ul className="list-disc ml-6 space-y-1">
          {progressNotes.map((note, idx) => (
            <li key={idx}>{note}</li>
          ))}
        </ul>
      </section>

      {/* Next Session Preparation */}
      <section className="mb-6">
        <h3 className="text-lg font-bold mb-2">📅 Next Session Preparation</h3>
        <ul className="list-disc ml-6 space-y-1">
          {nextSessionPreparation.map((prep, idx) => (
            <li key={idx}>{prep}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default SessionPlanTemplate;