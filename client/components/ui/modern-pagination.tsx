import React from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface Step {
  title: string;
  description?: string;
  completed?: boolean;
}

interface ModernPaginationProps {
  steps: (string | Step)[];
  currentStep: number;
  onStepChange: (step: number) => void;
  showProgress?: boolean;
  allowClickNavigation?: boolean;
  variant?: "default" | "compact" | "numbered";
}

export function ModernPagination({
  steps,
  currentStep,
  onStepChange,
  showProgress = true,
  allowClickNavigation = true,
  variant = "default",
}: ModernPaginationProps) {
  const normalizedSteps = steps.map((step, index) =>
    typeof step === "string"
      ? { title: step, completed: index < currentStep }
      : { ...step, completed: step.completed ?? index < currentStep },
  );

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  const handleStepClick = (stepIndex: number) => {
    if (allowClickNavigation) {
      onStepChange(stepIndex);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onStepChange(currentStep + 1);
    }
  };

  if (variant === "compact") {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {normalizedSteps[currentStep].title}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === steps.length - 1}
              className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        {showProgress && (
          <div className="relative w-full bg-gray-200 rounded-full h-2">
            <div
              className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  if (variant === "numbered") {
    return (
      <div className="bg-white rounded-xl border shadow-sm mt-6 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Form Progress</h3>
          <div className="text-sm text-gray-500">
            {currentStep + 1} of {steps.length} completed
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {normalizedSteps.map((step, index) => (
            <div
              key={index}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-md
                ${
                  index === currentStep
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : step.completed
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                }
              `}
              onClick={() => handleStepClick(index)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${
                    index === currentStep
                      ? "bg-blue-500 text-white"
                      : step.completed
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-600"
                  }
                `}
                >
                  {step.completed && index !== currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`
                    text-sm font-medium truncate transition-colors duration-300
                    ${
                      index === currentStep
                        ? "text-blue-700"
                        : step.completed
                          ? "text-green-700"
                          : "text-gray-600"
                    }
                  `}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {index === currentStep && (
                <div className="absolute inset-0 rounded-lg bg-blue-500 opacity-10 animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {showProgress && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Overall Progress
              </span>
              <span className="text-sm font-medium text-blue-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="relative w-full bg-gray-200 rounded-full h-3">
              <div
                className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default variant - horizontal stepper
  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {normalizedSteps[currentStep].title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Steps */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {normalizedSteps.map((step, index) => (
            <div key={index} className="flex flex-col items-center relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-0.5 -z-10">
                  <div className="w-full h-full bg-gray-200">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                      style={{
                        width: index < currentStep ? "100%" : "0%",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Step Circle */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer transition-all duration-300 relative z-10
                  ${
                    index === currentStep
                      ? "bg-blue-500 text-white shadow-lg scale-110"
                      : step.completed
                        ? "bg-green-500 text-white shadow-md hover:scale-105"
                        : "bg-gray-300 text-gray-600 hover:bg-gray-400 hover:scale-105"
                  }
                `}
                onClick={() => handleStepClick(index)}
              >
                {step.completed && index !== currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}

                {index === currentStep && (
                  <div className="absolute inset-0 rounded-full bg-blue-500 opacity-30 animate-ping" />
                )}
              </div>

              {/* Step Label */}
              <div className="mt-3 text-center max-w-24">
                <div
                  className={`
                  text-xs font-medium transition-colors duration-300
                  ${
                    index === currentStep
                      ? "text-blue-700"
                      : step.completed
                        ? "text-green-700"
                        : "text-gray-500"
                  }
                `}
                >
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-xs text-gray-400 mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-2">
            <div
              className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
