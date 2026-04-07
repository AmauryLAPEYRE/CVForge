"use client";

import { createContext, useContext, useReducer, type Dispatch } from "react";
import type { AppState, CVData, GeneratedCV, Step } from "@/lib/types";

const initialState: AppState = {
  step: 0,
  cvData: null,
  jobOffer: "",
  generatedCVs: [],
  selectedCVId: null,
  originalCvData: null,
  isExtracting: false,
  extractionProgress: 0,
  isGenerating: false,
  generationProgress: 0,
  isAdapting: false,
};

type Action =
  | { type: "SET_STEP"; step: Step }
  | { type: "SET_CV_DATA"; data: CVData }
  | { type: "SET_JOB_OFFER"; text: string }
  | { type: "SET_GENERATED_CVS"; cvs: GeneratedCV[] }
  | { type: "ADD_GENERATED_CVS"; cvs: GeneratedCV[] }
  | { type: "SELECT_CV"; id: string | null }
  | { type: "SET_ADAPTING"; value: boolean }
  | { type: "RESTORE_ORIGINAL_CV" }
  | { type: "SET_EXTRACTING"; value: boolean }
  | { type: "SET_EXTRACTION_PROGRESS"; value: number }
  | { type: "SET_GENERATING"; value: boolean }
  | { type: "SET_GENERATION_PROGRESS"; value: number }
  | { type: "UPDATE_CV_COLOR"; id: string; color: string }
  | { type: "UPDATE_CV_LAYOUT"; id: string; layout: GeneratedCV["layout"] };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_CV_DATA":
      return {
        ...state,
        cvData: action.data,
        originalCvData: state.originalCvData || action.data,
      };
    case "SET_JOB_OFFER":
      return { ...state, jobOffer: action.text };
    case "SET_GENERATED_CVS":
      return { ...state, generatedCVs: action.cvs, selectedCVId: null };
    case "ADD_GENERATED_CVS":
      return { ...state, generatedCVs: [...state.generatedCVs, ...action.cvs] };
    case "SELECT_CV":
      return { ...state, selectedCVId: action.id };
    case "SET_ADAPTING":
      return { ...state, isAdapting: action.value };
    case "RESTORE_ORIGINAL_CV":
      return { ...state, cvData: state.originalCvData, isAdapting: false };
    case "SET_EXTRACTING":
      return { ...state, isExtracting: action.value, extractionProgress: action.value ? 0 : state.extractionProgress };
    case "SET_EXTRACTION_PROGRESS":
      return { ...state, extractionProgress: action.value };
    case "SET_GENERATING":
      return { ...state, isGenerating: action.value, generationProgress: action.value ? 0 : state.generationProgress };
    case "SET_GENERATION_PROGRESS":
      return { ...state, generationProgress: action.value };
    case "UPDATE_CV_COLOR":
      return {
        ...state,
        generatedCVs: state.generatedCVs.map((cv) =>
          cv.id === action.id ? { ...cv, accentColor: action.color } : cv
        ),
      };
    case "UPDATE_CV_LAYOUT":
      return {
        ...state,
        generatedCVs: state.generatedCVs.map((cv) =>
          cv.id === action.id ? { ...cv, layout: action.layout } : cv
        ),
      };
    default:
      return state;
  }
}

export const CVStoreContext = createContext<{
  state: AppState;
  dispatch: Dispatch<Action>;
}>({ state: initialState, dispatch: () => {} });

export function useCVStore() {
  return useContext(CVStoreContext);
}

export { initialState, reducer };
export type { Action };
