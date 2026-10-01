"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CareerState, loadCareerState, saveCareerState } from "../lib/career-state";

type QuestionType = "text" | "multi";

type Data = {
  currentRole: string;
  interests: string;
  education: string;
  skills: string[];
};

type Question = {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
};

const defaultData: Data = {
  currentRole: "",
  interests: "",
  education: "",
  skills: [],
};

export default function CareerDNA() {
  const router = useRouter();

  const [data, setData] = useState<Data>(defaultData);
  const [step, setStep] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("careerpilot-dna");

      if (saved) {
        const parsed = JSON.parse(saved);

        setData({
          ...defaultData,
          ...parsed,
          skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        });
      }
    } catch {
      // Ignore invalid local storage data
    }
  }, []);

  const questions = useMemo<Question[]>(() => {
    const result: Question[] = [
      {
        id: "currentRole",
        type: "text",
        title: "What do you currently do?",
        description:
          "Tell us where you are professionally right now. If you're a student or looking for your first job, that's completely fine.",
        placeholder: "e.g. BCA student, Data Analyst, Marketing Executive",
        required: true,
      },
      {
        id: "education",
        type: "text",
        title: "What's your education background?",
        description:
          "Add your highest qualification or the education you're currently pursuing.",
        placeholder: "e.g. BCA, B.Com, MBA, Diploma, 12th",
        required: true,
      },
      {
        id: "interests",
        type: "text",
        title: "What kind of work interests you?",
        description:
          "Tell CareerPilot about the fields, subjects, problems, or types of work you enjoy.",
        placeholder: "e.g. data, technology, finance, design, marketing",
        required: true,
      },
    ];

    if (data.skills.length === 0) {
      result.push({
        id: "skills",
        type: "multi",
        title: "Which skills do you already have?",
        description:
          "Select the skills you're comfortable with. CareerPilot will use these as your starting point, not as a final assessment.",
        options: [
          "SQL",
          "Excel",
          "Python",
          "Data Analysis",
          "Communication",
          "Problem Solving",
          "Programming",
          "Design",
        ],
        required: false,
      });
    }

    return result;
  }, [data.skills.length]);

  const currentQuestion = questions[step];
  const isLastQuestion = step === questions.length - 1;

  const getValue = () => {
    if (!currentQuestion) return "";

    return data[currentQuestion.id as keyof Data];
  };

  const hasValue = () => {
    const value = getValue();

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return Boolean(value);
  };

  const updateValue = (value: string | string[]) => {
    if (!currentQuestion) return;

    setData((previous) => ({
      ...previous,
      [currentQuestion.id]: value,
    }));
  };

  const toggleMulti = (option: string) => {
    const current = Array.isArray(getValue())
      ? (getValue() as string[])
      : [];

    if (current.includes(option)) {
      updateValue(current.filter((item) => item !== option));
    } else {
      updateValue([...current, option]);
    }
  };

  const next = () => {
    if (!currentQuestion) return;
    if (currentQuestion.required && !hasValue()) return;

    if (isLastQuestion) {
      try {
        localStorage.setItem("careerpilot-dna", JSON.stringify(data));
      } catch {
        // Ignore storage errors
      }

      setComplete(true);
      return;
    }

    setStep((previous) => previous + 1);
  };

  const back = () => {
    if (step === 0) {
      router.push("/");
      return;
    }

    setStep((previous) => previous - 1);
  };

  const goToCareerGoal = () => {
    try {
      localStorage.setItem("careerpilot-dna", JSON.stringify(data));

      const current = loadCareerState();

      const nextState: CareerState = {
        ...current,
        profile: {
          ...current.profile,
          education: data.education,
          currentRole: data.currentRole,
        },
        skills: data.skills,
        experience:
          current.experience ||
          (data.currentRole.toLowerCase().includes("student")
            ? "Early career"
            : "Working professional"),
      };

      saveCareerState(nextState);
    } catch {
      // Ignore storage errors
    }

    router.push("/career-goal");
  };

  if (complete) {
    return (
      <main className="min-h-[100svh] bg-[#fafafa] text-[#171717]">
        <div className="mx-auto flex min-h-[100svh] max-w-2xl flex-col px-6 sm:px-8">
          <header className="flex items-center justify-between py-6">
            <button
              onClick={() => router.push("/")}
              className="text-[23px] font-bold tracking-[-0.04em]"
            >
              CareerPilot
            </button>

            <span className="text-sm text-neutral-500">Complete</span>
          </header>

          <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200">
            <div className="h-full w-full rounded-full bg-[#171717]" />
          </div>

          <section className="flex flex-1 flex-col justify-center py-16">
            <div className="max-w-xl">
              <p className="mb-4 text-[15px] font-medium text-neutral-500">
                Career DNA
              </p>

              <h1 className="max-w-lg text-[42px] font-semibold leading-[1.04] tracking-[-0.045em] sm:text-[52px]">
                Your Career DNA is ready.
              </h1>

              <p className="mt-5 max-w-lg text-[17px] leading-7 text-neutral-500">
                We have captured the professional context CareerPilot needs
                to understand your starting point.
              </p>

              <button
                onClick={goToCareerGoal}
                className="mt-10 inline-flex h-12 items-center rounded-xl bg-[#171717] px-6 text-[15px] font-medium text-white transition hover:bg-black"
              >
                Define my Career Goal
                <span className="ml-2">→</span>
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const value = getValue();

  return (
    <main className="min-h-[100svh] bg-[#fafafa] text-[#171717]">
      <div className="mx-auto flex min-h-[100svh] max-w-2xl flex-col px-6 sm:px-8">
        <header className="flex items-center justify-between py-6">
          <button
            onClick={() => router.push("/")}
            className="text-[23px] font-bold tracking-[-0.04em]"
          >
            CareerPilot
          </button>

          <span className="text-sm text-neutral-500">
            {step + 1} of {questions.length}
          </span>
        </header>

        <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-[#171717] transition-all duration-300"
            style={{
              width: `${((step + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <section className="flex-1 py-24 sm:py-28">
          <div className="mx-auto max-w-xl">
            <p className="mb-5 text-[15px] font-medium text-neutral-500">
              Career DNA
            </p>

            <h1 className="max-w-xl text-[40px] font-semibold leading-[1.06] tracking-[-0.045em] sm:text-[50px]">
              {currentQuestion.title}
            </h1>

            {currentQuestion.description && (
              <p className="mt-4 max-w-lg text-[16px] leading-6 text-neutral-500">
                {currentQuestion.description}
              </p>
            )}

            {currentQuestion.type === "text" && (
              <div className="mt-8">
                <input
                  type="text"
                  value={typeof value === "string" ? value : ""}
                  onChange={(event) => updateValue(event.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="h-14 w-full rounded-xl border border-neutral-200 bg-white px-4 text-[16px] outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                  autoFocus
                />
              </div>
            )}

            {currentQuestion.type === "multi" && currentQuestion.options && (
              <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {currentQuestion.options.map((option) => {
                  const selected =
                    Array.isArray(value) && value.includes(option);

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleMulti(option)}
                      className={`min-h-11 rounded-xl border px-4 text-left text-[15px] transition ${
                        selected
                          ? "border-[#171717] bg-[#171717] text-white"
                          : "border-neutral-200 bg-white hover:border-neutral-400"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <footer className="border-t border-neutral-200 py-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              className="text-[16px] text-neutral-700 transition hover:text-black"
            >
              Back
            </button>

            <button
              type="button"
              onClick={next}
              disabled={currentQuestion.required && !hasValue()}
              className={`inline-flex h-11 items-center rounded-xl px-5 text-[15px] font-medium transition ${
                currentQuestion.required && !hasValue()
                  ? "cursor-not-allowed bg-neutral-200 text-neutral-400"
                  : "bg-[#171717] text-white hover:bg-black"
              }`}
            >
              {isLastQuestion ? "Finish Career DNA" : "Continue"}
              <span className="ml-2">→</span>
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
