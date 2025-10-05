"use client";

import { useState } from "react";
import { useForm, useFieldArray, Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuizSchema, QuizFormType } from "@/types";
import { createQuiz } from "@/actions/firebaseActions";
import { useAuth } from "@/contexts/AuthContext";

interface QuizFormProps {
 onQuizCreated: () => void;
 onCancel: () => void;
}

export default function QuizForm({ onQuizCreated, onCancel }: QuizFormProps) {
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState<string>("");
 const { user } = useAuth();

 const {
  register,
  control,
  handleSubmit,
  formState: { errors },
 } = useForm<QuizFormType>({
  resolver: zodResolver(QuizSchema),
  defaultValues: {
   title: "",
   description: "",
   questions: [{
    text: "",
    answers: [
     { text: "", isCorrect: false },
     { text: "", isCorrect: false }
    ],
    points: 1,
   }],
  },
 });

 const { fields: questions, append: appendQuestion, remove: removeQuestion } = useFieldArray({
  control,
  name: "questions",
 });

 const onSubmit = async (data: QuizFormType) => {
  if (!user) return;

  setIsLoading(true);
  setError("");

  try {
   // Validate that each question has at least one correct answer
   for (const question of data.questions) {
    const hasCorrectAnswer = question.answers.some(answer => answer.isCorrect);
    if (!hasCorrectAnswer) {
     setError("Each question must have at least one correct answer");
     setIsLoading(false);
     return;
    }
   }

   // Generate IDs for questions and answers
   const questionsWithIds = data.questions.map((question, qIndex) => ({
    ...question,
    id: `q_${Date.now()}_${qIndex}`,
    answers: question.answers.map((answer, aIndex) => ({
     ...answer,
     id: `a_${Date.now()}_${qIndex}_${aIndex}`,
    })),
   }));

   const quizData = {
    ...data,
    questions: questionsWithIds,
    createdBy: user.id,
    isActive: true,
   };

   const result = await createQuiz(quizData);

   if (result) {
    onQuizCreated();
   } else {
    setError("Failed to create quiz. Please try again.");
   }
  } catch (err: unknown) {
   setError(err instanceof Error ? err.message : "An error occurred while creating the quiz");
   console.error(err);
  } finally {
   setIsLoading(false);
  }
 };

 const addQuestion = () => {
  appendQuestion({
   text: "",
   answers: [
    { text: "", isCorrect: false },
    { text: "", isCorrect: false }
   ],
   points: 1,
  });
 };



 return (
  <div className="max-w-4xl mx-auto bg-white p-8 ">
   <h2 className="text-2xl font-bold text-center mb-6 text-black">
    Create New Quiz
   </h2>

   {error && (
    <div className="mb-4 p-3 bg-white border border-black rounded text-black">
     {error}
    </div>
   )}

   <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
    {/* Quiz Info */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <div>
      <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">
       Quiz Title
      </label>
      <input
       {...register("title")}
       type="text"
       id="title"
       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
       placeholder="Enter quiz title"
      />
      {errors.title && (
       <p className="mt-1 text-sm text-black">{errors.title.message}</p>
      )}
     </div>

     <div>
      <label htmlFor="duration" className="block text-sm font-medium text-gray-400 mb-1">
       Duration (minutes, optional)
      </label>
      <input
       {...register("duration", { valueAsNumber: true })}
       type="number"
       id="duration"
       min="1"
       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
       placeholder="e.g., 30"
      />
     </div>
    </div>

    <div>
     <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">
      Description
     </label>
     <textarea
      {...register("description")}
      id="description"
      rows={3}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
      placeholder="Enter quiz description"
     />
     {errors.description && (
      <p className="mt-1 text-sm text-black">{errors.description.message}</p>
     )}
    </div>

    {/* Questions */}
    <div>
     <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-black">Questions</h3>
      <button
       type="button"
       onClick={addQuestion}
       className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
      >
       Add Question
      </button>
     </div>

     {questions.map((question, questionIndex) => (
      <QuestionForm
       key={question.id}
       questionIndex={questionIndex}
       register={register}
       control={control}
       errors={errors}
       onRemove={() => removeQuestion(questionIndex)}
       canRemove={questions.length > 1}
      />
     ))}
    </div>

    {/* Actions */}
    <div className="flex justify-end space-x-4 pt-6">
     <button
      type="button"
      onClick={onCancel}
      className="px-6 py-2 border border-gray-300 rounded-md text-gray-400 hover:bg-white transition-colors"
     >
      Cancel
     </button>
     <button
      type="submit"
      disabled={isLoading}
      className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
     >
      {isLoading ? "Creating..." : "Create Quiz"}
     </button>
    </div>
   </form>
  </div>
 );
}

interface QuestionFormProps {
 questionIndex: number;
 register: UseFormRegister<QuizFormType>;
 control: Control<QuizFormType>;
 errors: FieldErrors<QuizFormType>;
 onRemove: () => void;
 canRemove: boolean;
}

function QuestionForm({ questionIndex, register, control, errors, onRemove, canRemove }: QuestionFormProps) {
 const { fields: answers, append: appendAnswer, remove: removeAnswer } = useFieldArray({
  control,
  name: `questions.${questionIndex}.answers`,
 });

 return (
  <div className="border border-gray-300 rounded-md p-4 mb-4">
   <div className="flex justify-between items-start mb-4">
    <h4 className="text-md font-medium text-black">Question {questionIndex + 1}</h4>
    {canRemove && (
     <button
      type="button"
      onClick={onRemove}
      className="text-black rounded-md hover:text-black text-sm"
     >
      Remove Question
     </button>
    )}
   </div>

   <div className="space-y-4">
    <div>
     <label className="block text-sm font-medium text-gray-400 mb-1">
      Question Text
     </label>
     <input
      {...register(`questions.${questionIndex}.text`)}
      type="text"
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
      placeholder="Enter your question"
     />
     {errors.questions?.[questionIndex]?.text && (
      <p className="mt-1 text-sm text-black">
       {errors.questions[questionIndex].text.message}
      </p>
     )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">
       Points
      </label>
      <input
       {...register(`questions.${questionIndex}.points`, { valueAsNumber: true })}
       type="number"
       min="1"
       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
       placeholder="1"
      />
     </div>
     <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">
       Time Limit (seconds, optional)
      </label>
      <input
       {...register(`questions.${questionIndex}.timeLimit`, { valueAsNumber: true })}
       type="number"
       min="1"
       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
       placeholder="e.g., 30"
      />
     </div>
    </div>

    <div>
     <div className="flex justify-between items-center mb-2">
      <label className="block text-sm font-medium text-gray-400">
       Answers
      </label>
      <button
       type="button"
       onClick={() => appendAnswer({ text: "", isCorrect: false })}
       className="text-black rounded-md hover:text-blue-800 text-sm"
      >
       Add Answer
      </button>
     </div>

     {answers.map((answer, answerIndex) => (
      <div key={answer.id} className="flex items-center space-x-2 mb-2">
       <input
        {...register(`questions.${questionIndex}.answers.${answerIndex}.text`)}
        type="text"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        placeholder={`Answer ${answerIndex + 1}`}
       />
       <label className="flex items-center space-x-1">
        <input
         {...register(`questions.${questionIndex}.answers.${answerIndex}.isCorrect`)}
         type="checkbox"
         className="w-4 h-4 rounded-full text-black"
        />
        <span className="text-sm text-gray-400">Correct</span>
       </label>
       {answers.length > 2 && (
        <button
         type="button"
         onClick={() => removeAnswer(answerIndex)}
         className="text-black rounded-md hover:text-black text-sm px-2"
        >
         Remove
        </button>
       )}
      </div>
     ))}
    </div>
   </div>
  </div>
 );
}