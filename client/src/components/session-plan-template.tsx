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
    focus?: string; // e.g., "Upper Body Strength"
  };
  equipmentNeeded: {
    equipmentList: string[]; // main equipment list
    weights?: string[]; // specific weights needed
    machines?: string[]; // machines needed
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
      rest?: string; // rest period after this exercise
      load?: string; // weight/resistance
      notes: string;
      technique?: string; // proper form notes
    }>;
  }>;
  extraWork?: {
    explanation: string;
    exercises: Array<{
      exercise: string;
      sets: string;
      reps: string;
      load?: string;
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
  clientFeedback?: string[];
  progressSummary?: {
    improvements: string[];
    challenges: string[];
    nextFocusAreas: string[];
  };
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
    clientFeedback,
    progressSummary
  } = plan;

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-lg shadow-md">
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

      {/* Header with Logo and Title */}
      <div className="mb-6 border-b pb-6 flex flex-col items-center">
        <div className="flex justify-center mb-4">
          <div className="h-24 w-24 bg-primary/20 rounded-full flex items-center justify-center text-4xl">
            🏋️‍♂️
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">SESSION PLAN</h1>
        {sessionDetails.focus && (
          <h2 className="text-xl text-center text-primary mb-4">{sessionDetails.focus}</h2>
        )}
      </div>

      {/* Session Plan Details */}
      <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <div>
          <h2 className="text-xl font-bold mb-4 border-b pb-2 text-primary">📋 CLIENT DETAILS</h2>
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <span className="font-semibold min-w-[120px]">👤 Client Name:</span> 
              <span className="font-medium">{sessionDetails.clientName}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold min-w-[120px]">👨‍🏫 Coach:</span> 
              <span className="font-medium">{sessionDetails.coach}</span>
            </p>
            {sessionDetails.date && (
              <p className="flex items-center gap-2">
                <span className="font-semibold min-w-[120px]">📅 Date:</span> 
                <span className="font-medium">{sessionDetails.date}</span>
              </p>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4 border-b pb-2 text-primary">🔍 SESSION DETAILS</h2>
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <span className="font-semibold min-w-[120px]">🎯 Session Type:</span> 
              <span className="font-medium">{sessionDetails.sessionType}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold min-w-[120px]">⏱ Duration:</span> 
              <span className="font-medium">{sessionDetails.duration}</span>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold min-w-[120px]">📍 Location:</span> 
              <span className="font-medium">{sessionDetails.location}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Equipment Needed */}
      <section className="mb-8 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-primary">🎒 EQUIPMENT NEEDED</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-700 p-4 rounded-md shadow-sm">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <span className="text-2xl">🔧</span> Main Equipment
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              {equipmentNeeded.equipmentList.map((item, idx) => (
                <li key={idx} className="font-medium">{item}</li>
              ))}
            </ul>
          </div>
          
          {equipmentNeeded.weights && equipmentNeeded.weights.length > 0 && (
            <div className="bg-white dark:bg-gray-700 p-4 rounded-md shadow-sm">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">⚖️</span> Weights
              </h3>
              <ul className="list-disc ml-6 space-y-1">
                {equipmentNeeded.weights.map((weight, idx) => (
                  <li key={idx} className="font-medium">{weight}</li>
                ))}
              </ul>
            </div>
          )}
          
          {equipmentNeeded.machines && equipmentNeeded.machines.length > 0 && (
            <div className="bg-white dark:bg-gray-700 p-4 rounded-md shadow-sm">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">🤖</span> Machines
              </h3>
              <ul className="list-disc ml-6 space-y-1">
                {equipmentNeeded.machines.map((machine, idx) => (
                  <li key={idx} className="font-medium">{machine}</li>
                ))}
              </ul>
            </div>
          )}
          
          {equipmentNeeded.other && (
            <div className="bg-white dark:bg-gray-700 p-4 rounded-md shadow-sm">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">📦</span> Other Items
              </h3>
              <p className="font-medium ml-2">{equipmentNeeded.other}</p>
            </div>
          )}
        </div>
      </section>

      {/* Warm-Up */}
      <section className="mb-8 bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border-l-4 border-orange-400">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400">
          🌅 1. MOBILITY & WARM-UP (10-12 mins)
        </h2>
        <p className="mb-4 font-medium">
          <strong className="text-orange-600 dark:text-orange-400">Purpose:</strong> {warmup.explanation}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse mb-2 bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200">
                <th className="text-left p-3 font-bold">Exercise</th>
                <th className="text-left p-3 font-bold">Duration/Reps</th>
                <th className="text-left p-3 font-bold">Coaching Notes</th>
              </tr>
            </thead>
            <tbody>
              {warmup.exercises.map((ex, idx) => (
                <tr key={idx} className="border-b border-orange-100 dark:border-orange-900/30 hover:bg-orange-50 dark:hover:bg-orange-900/10">
                  <td className="p-3 font-medium">{ex.exercise}</td>
                  <td className="p-3">{ex.durationOrReps}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">{ex.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* The Workout */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center bg-primary/10 py-3 rounded-lg text-primary border-b-2 border-primary">
          💪 2. THE WORKOUT
        </h2>
        
        {mainWorkout.map((block, idx) => (
          <div key={idx} className="mb-8 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="bg-primary text-primary-foreground py-2 px-4 rounded-t-lg inline-block -mt-10 mb-2 font-bold text-lg shadow">
              {block.blockTitle}
            </div>
            
            <div className="mb-4 flex flex-wrap gap-3">
              <div className="bg-white dark:bg-gray-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-sm">
                <span className="text-primary">⏱️</span> {block.format}
              </div>
            </div>
            
            <p className="mb-5 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-3 rounded-md">
              <strong className="text-primary">Instructions:</strong> {block.explanation}
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white dark:bg-gray-700 shadow rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-primary/20 text-primary dark:text-primary-foreground">
                    <th className="text-left p-3 font-bold">Exercise</th>
                    <th className="text-left p-3 font-bold">Sets & Reps/Time</th>
                    <th className="text-left p-3 font-bold">Load/Weight</th>
                    <th className="text-left p-3 font-bold">Rest</th>
                    <th className="text-left p-3 font-bold">Technique Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {block.exercises.map((ex, i) => (
                    <tr key={i} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-3 font-medium">{ex.exercise}</td>
                      <td className="p-3">{ex.repsOrTime}</td>
                      <td className="p-3">{ex.load || "Body weight"}</td>
                      <td className="p-3">{ex.rest || "Minimal"}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-300">
                        {ex.technique || ex.notes}
                      </td>
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
        <section className="mb-8 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border-l-4 border-purple-400">
          <h2 className="text-xl font-bold mb-4 border-b pb-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400">
            🎯 3. EXTRA WORK (Optional)
          </h2>
          <p className="mb-4 font-medium">
            <strong className="text-purple-600 dark:text-purple-400">Purpose:</strong> {extraWork.explanation}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse mb-2 bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200">
                  <th className="text-left p-3 font-bold">Exercise</th>
                  <th className="text-left p-3 font-bold">Sets</th>
                  <th className="text-left p-3 font-bold">Reps</th>
                  <th className="text-left p-3 font-bold">Load</th>
                  <th className="text-left p-3 font-bold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {extraWork.exercises.map((ex, idx) => (
                  <tr key={idx} className="border-b border-purple-100 dark:border-purple-900/30 hover:bg-purple-50 dark:hover:bg-purple-900/10">
                    <td className="p-3 font-medium">{ex.exercise}</td>
                    <td className="p-3">{ex.sets}</td>
                    <td className="p-3">{ex.reps}</td>
                    <td className="p-3">{ex.load || "As appropriate"}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">{ex.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Cool-Down & Mobility */}
      <section className="mb-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-l-4 border-blue-400">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
          🧘 4. COOL-DOWN & MOBILITY (5-10 mins)
        </h2>
        <p className="mb-4 font-medium">
          <strong className="text-blue-600 dark:text-blue-400">Purpose:</strong> {cooldown.explanation}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse mb-2 bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200">
                <th className="text-left p-3 font-bold">Exercise</th>
                <th className="text-left p-3 font-bold">Duration</th>
                <th className="text-left p-3 font-bold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {cooldown.exercises.map((ex, idx) => (
                <tr key={idx} className="border-b border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 dark:hover:bg-blue-900/10">
                  <td className="p-3 font-medium">{ex.exercise}</td>
                  <td className="p-3">{ex.duration}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">{ex.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Machine Setup Guide */}
      <section className="mb-8 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 text-gray-700 dark:text-gray-300">
          ⚙️ 5. MACHINE SETUP GUIDE
        </h2>
        <p className="mb-4 font-medium text-gray-700 dark:text-gray-300">
          {machineSetupGuide.explanation}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white dark:bg-gray-700 shadow-sm rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                <th className="text-left p-3 font-bold">Machine/Equipment</th>
                <th className="text-left p-3 font-bold">Setup Instructions</th>
              </tr>
            </thead>
            <tbody>
              {machineSetupGuide.machines.map((m, idx) => (
                <tr key={idx} className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-3 font-medium">{m.machine}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">{m.setupInstructions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Closing Message */}
      <section className="mb-8 bg-primary/10 p-6 rounded-lg border border-primary/30">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 border-primary/30 text-primary">
          📝 6. CLOSING MESSAGE
        </h2>
        <p className="p-4 border rounded-md bg-white dark:bg-gray-800 shadow-inner text-gray-700 dark:text-gray-300 leading-relaxed">
          {closingMessage}
        </p>
      </section>

      {/* Progress Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Progress Notes */}
        <section className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border-l-4 border-green-400">
          <h3 className="text-lg font-bold mb-4 border-b pb-2 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400">
            🎯 PROGRESS NOTES
          </h3>
          <ul className="list-disc ml-6 space-y-2">
            {progressNotes.map((note, idx) => (
              <li key={idx} className="text-gray-700 dark:text-gray-300">{note}</li>
            ))}
          </ul>
          
          {progressSummary && (
            <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
              <div className="mb-2">
                <h4 className="font-bold text-green-600 dark:text-green-400">Improvements:</h4>
                <ul className="list-disc ml-6">
                  {progressSummary.improvements.map((item, idx) => (
                    <li key={idx} className="text-gray-700 dark:text-gray-300">{item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-2">
                <h4 className="font-bold text-amber-600 dark:text-amber-400">Challenges:</h4>
                <ul className="list-disc ml-6">
                  {progressSummary.challenges.map((item, idx) => (
                    <li key={idx} className="text-gray-700 dark:text-gray-300">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* Next Session Preparation */}
        <section className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border-l-4 border-amber-400">
          <h3 className="text-lg font-bold mb-4 border-b pb-2 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400">
            📅 NEXT SESSION PREPARATION
          </h3>
          <ul className="list-disc ml-6 space-y-2">
            {nextSessionPreparation.map((prep, idx) => (
              <li key={idx} className="text-gray-700 dark:text-gray-300">{prep}</li>
            ))}
          </ul>
          
          {progressSummary && (
            <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
              <h4 className="font-bold text-amber-600 dark:text-amber-400">Focus Areas:</h4>
              <ul className="list-disc ml-6">
                {progressSummary.nextFocusAreas.map((area, idx) => (
                  <li key={idx} className="text-gray-700 dark:text-gray-300">{area}</li>
                ))}
              </ul>
            </div>
          )}
          
          {clientFeedback && (
            <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
              <h4 className="font-bold text-amber-600 dark:text-amber-400">Client Feedback:</h4>
              <ul className="list-disc ml-6">
                {clientFeedback.map((feedback, idx) => (
                  <li key={idx} className="text-gray-700 dark:text-gray-300">{feedback}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
      
      {/* Footer */}
      <footer className="mt-12 pt-4 border-t text-center text-gray-500 dark:text-gray-400">
        <p>Created with FitPro AI • {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
};

export default SessionPlanTemplate;