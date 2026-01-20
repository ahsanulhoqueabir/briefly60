"use client";

import usePrivateAxios from "@/hooks/use-private-axios";
import { MCQ } from "@/types/news.types";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  mcqs: MCQ[];
  newsId: string;
}

export default function QuizModal({
  isOpen,
  onClose,
  mcqs,
  newsId,
}: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const axios = usePrivateAxios();

  if (!isOpen) return null;

  // Parse MCQs if they come as a JSON string
  const parsedMcqs: MCQ[] = typeof mcqs === "string" ? JSON.parse(mcqs) : mcqs;

  const currentQuestion = parsedMcqs[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === parsedMcqs.length - 1;

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const submitQuizResults = async (answers: string[]) => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");

      // Check if at least one question is answered
      const hasAtLeastOneAnswer = answers.some(
        (answer) => answer && answer.trim() !== "",
      );

      if (!hasAtLeastOneAnswer) {
        setErrorMessage("অন্তত একটি প্রশ্নের উত্তর দিতে হবে!");
        setIsSubmitting(false);
        return;
      }

      // Prepare answers array for ALL questions (including skipped ones)
      const answersArray = answers.map((answer, index) => {
        return {
          question: parsedMcqs[index].question,
          user_answer: answer || "", // Send empty string for skipped questions
        };
      });

      // Prepare payload matching API expectations
      const payload = {
        article_id: newsId,
        answers: answersArray,
      };

      // Submit to API
      const response = await axios.post("/api/quiz", payload);
      console.log("Quiz submitted successfully:", response.data);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      setErrorMessage("কুইজ জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    setErrorMessage(""); // Clear any previous errors
    const newAnswers = [...selectedAnswers, selectedOption];
    setSelectedAnswers(newAnswers);

    if (isLastQuestion) {
      setShowResults(true);
      // Submit quiz results
      submitQuizResults(newAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    }
  };

  const handleSkip = () => {
    setErrorMessage(""); // Clear any previous errors
    const newAnswers = [...selectedAnswers, ""];
    setSelectedAnswers(newAnswers);

    if (isLastQuestion) {
      // Check if at least one question is answered before showing results
      const hasAtLeastOneAnswer = newAnswers.some(
        (answer) => answer && answer.trim() !== "",
      );

      if (!hasAtLeastOneAnswer) {
        setErrorMessage(
          "অন্তত একটি প্রশ্নের উত্তর দিতে হবে! আগের প্রশ্নে ফিরে যান এবং উত্তর দিন।",
        );
        return;
      }

      setShowResults(true);
      // Submit quiz results
      submitQuizResults(newAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setErrorMessage(""); // Clear any errors
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Restore previous answer
      const previousAnswer = selectedAnswers[currentQuestionIndex - 1];
      setSelectedOption(previousAnswer || null);
      // Remove the last answer from the array
      setSelectedAnswers(selectedAnswers.slice(0, -1));
    }
  };

  const handleClose = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setSelectedOption(null);
    setErrorMessage("");
    onClose();
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === parsedMcqs[index].correct_answer) {
        correct++;
      }
    });
    return correct;
  };

  const score = showResults ? calculateScore() : 0;
  const percentage = showResults
    ? Math.round((score / parsedMcqs.length) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-primary">Quiz</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Close"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          {!showResults && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>
                  প্রশ্ন {currentQuestionIndex + 1} / {parsedMcqs.length}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) / parsedMcqs.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {!showResults ? (
            <>
              {/* Question */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-primary mb-4">
                  {currentQuestion.question}
                </h3>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedOption === option
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-secondary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedOption === option
                              ? "border-primary bg-primary"
                              : "border-border"
                          }`}
                        >
                          {selectedOption === option && (
                            <div className="w-3 h-3 rounded-full bg-primary-foreground" />
                          )}
                        </span>
                        <span className="text-sm">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {errorMessage}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                {currentQuestionIndex > 0 && (
                  <button
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="py-3 px-6 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    পূর্ববর্তী
                  </button>
                )}
                <button
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-6 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  এড়িয়ে যান
                </button>
                <button
                  onClick={handleNext}
                  disabled={selectedOption === null || isSubmitting}
                  className="flex-1 py-3 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "জমা দেওয়া হচ্ছে..."
                    : isLastQuestion
                      ? "সম্পন্ন করুন"
                      : "পরবর্তী"}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Results */}
              <div className="text-center">
                <div className="mb-6">
                  <div
                    className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                      percentage >= 80
                        ? "bg-green-100 text-green-600"
                        : percentage >= 50
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-red-100 text-red-600"
                    }`}
                  >
                    {percentage >= 80 ? (
                      <CheckCircle2 className="w-12 h-12" />
                    ) : (
                      <span className="text-3xl font-bold">{percentage}%</span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-primary mb-2">
                    {percentage >= 80
                      ? "অসাধারণ!"
                      : percentage >= 50
                        ? "ভালো হয়েছে!"
                        : "চেষ্টা চালিয়ে যান!"}
                  </h3>

                  <p className="text-lg text-muted-foreground">
                    আপনি {parsedMcqs.length} টির মধ্যে {score} টি সঠিক উত্তর
                    দিয়েছেন
                  </p>
                </div>

                {/* Detailed Results */}
                <div className="space-y-4 text-left mb-6">
                  {parsedMcqs.map((mcq, index) => {
                    const userAnswer = selectedAnswers[index];
                    const isSkipped = !userAnswer || userAnswer === "";
                    const isCorrect =
                      !isSkipped && userAnswer === mcq.correct_answer;

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${
                          isSkipped
                            ? "border-gray-400 bg-gray-50"
                            : isCorrect
                              ? "border-green-500 bg-green-50"
                              : "border-red-500 bg-red-50"
                        }`}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          {isSkipped ? (
                            <XCircle className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                          ) : isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-primary">
                              প্রশ্ন {index + 1}: {mcq.question}
                            </p>
                            {isSkipped ? (
                              <p className="text-xs text-gray-600 mt-1">
                                এই প্রশ্নটি এড়িয়ে যাওয়া হয়েছে
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground mt-1">
                                আপনার উত্তর:{" "}
                                <span className="font-medium">
                                  {userAnswer}
                                </span>
                              </p>
                            )}
                            {!isCorrect && (
                              <p className="text-xs text-green-700 mt-1">
                                সঠিক উত্তর:{" "}
                                <span className="font-medium">
                                  {mcq.correct_answer}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  বন্ধ করুন
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
