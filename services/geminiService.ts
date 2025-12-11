import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { AgentType, DelegationResult } from "../types";
import { CENTRAL_MANAGER_SYSTEM_INSTRUCTION, AGENT_PROMPTS } from "../constants";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Define Tools for the Central Manager
const admissionTool: FunctionDeclaration = {
  name: "delegateToAdmission",
  description: "Delegates the task to the Patient Admission Agent for registration or medical records.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      context: { type: Type.STRING, description: "The full context and details of the user request to be passed to the agent." },
      reason: { type: Type.STRING, description: "Brief reason why this agent was selected." }
    },
    required: ["context", "reason"]
  }
};

const schedulingTool: FunctionDeclaration = {
  name: "delegateToScheduling",
  description: "Delegates the task to the Appointment Scheduling Agent for booking or availability checks.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      context: { type: Type.STRING, description: "The full context and details of the user request." },
      reason: { type: Type.STRING, description: "Brief reason why this agent was selected." }
    },
    required: ["context", "reason"]
  }
};

const pharmacyTool: FunctionDeclaration = {
  name: "delegateToPharmacy",
  description: "Delegates the task to the Pharmacy Management Agent for prescriptions or medicine stock.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      context: { type: Type.STRING, description: "The full context and details of the user request." },
      reason: { type: Type.STRING, description: "Brief reason why this agent was selected." }
    },
    required: ["context", "reason"]
  }
};

const billingTool: FunctionDeclaration = {
  name: "delegateToBilling",
  description: "Delegates the task to the Billing & Finance Agent for invoices, claims, or costs.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      context: { type: Type.STRING, description: "The full context and details of the user request." },
      reason: { type: Type.STRING, description: "Brief reason why this agent was selected." }
    },
    required: ["context", "reason"]
  }
};

const centralManagerTools: Tool[] = [{
  functionDeclarations: [admissionTool, schedulingTool, pharmacyTool, billingTool]
}];

/**
 * Step 1: Central Manager analyzes the request and decides which agent to call.
 */
export const routeRequest = async (userMessage: string): Promise<DelegationResult> => {
  try {
    const model = 'gemini-2.5-flash'; // Using fast model for routing
    
    const response = await ai.models.generateContent({
      model: model,
      contents: userMessage,
      config: {
        systemInstruction: CENTRAL_MANAGER_SYSTEM_INSTRUCTION,
        tools: centralManagerTools,
        temperature: 0, // Deterministic routing
      }
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No response from Central Manager");
    }

    const firstPart = candidates[0].content.parts[0];

    // Check for function calls
    if (firstPart.functionCall) {
      const call = firstPart.functionCall;
      const args = call.args as any;
      
      let targetAgent = AgentType.CENTRAL_MANAGER;

      switch (call.name) {
        case "delegateToAdmission": targetAgent = AgentType.ADMISSION; break;
        case "delegateToScheduling": targetAgent = AgentType.SCHEDULING; break;
        case "delegateToPharmacy": targetAgent = AgentType.PHARMACY; break;
        case "delegateToBilling": targetAgent = AgentType.BILLING; break;
      }

      return {
        targetAgent,
        context: args.context || userMessage,
        reason: args.reason || "Delegated based on intent."
      };
    }

    // Fallback if no tool was called (should be rare with strict constraints)
    return {
      targetAgent: AgentType.CENTRAL_MANAGER,
      context: userMessage,
      reason: "Could not determine specialized agent. Please clarify."
    };

  } catch (error) {
    console.error("Routing Error:", error);
    return {
      targetAgent: AgentType.CENTRAL_MANAGER,
      context: userMessage,
      reason: "System Error during routing."
    };
  }
};

/**
 * Step 2: The selected agent executes the task based on the context.
 */
export const executeAgentTask = async (agent: AgentType, context: string): Promise<string> => {
  try {
    // For specific tasks, we can use Pro for better reasoning
    const model = 'gemini-2.5-flash'; 
    const instruction = AGENT_PROMPTS[agent];

    const response = await ai.models.generateContent({
      model: model,
      contents: context,
      config: {
        systemInstruction: instruction,
        temperature: 0.7,
      }
    });

    return response.text || "Agent processed the request but returned no text.";

  } catch (error) {
    console.error(`Execution Error (${agent}):`, error);
    return `Error: ${agent} failed to process request.`;
  }
};
