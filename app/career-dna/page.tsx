"use client";

// Career DNA type-safe state mapping

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CareerGoalType, OpportunityScope, WorkMode, CareerState, loadCareerState, saveCareerState } from "../lib/career-state";

type Goal =
  | "first-job"
  | "grow"
  | "switch"
  | "international"
  | "unsure"
  | "";

type Scope = "india" | "international" | "both" | "remote" | "";

type QuestionType = "single" | "multi" | "text";

type Data = {
  goal: Goal;
  currentRole: string;
  interests: string;
  education: string;
  skills: string[];
  currentLocation: string;
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
  goal: "",
  currentRole: "",
  interests: "",
  education: "",
  skills: [],
  currentLocation: "",
};

const roleSkills: Record<string, string[]> = {
  "Data Analyst": [
    "SQL",
    "Excel",
    "Power BI",
    "Tableau",
    "Python",
    "Statistics",
  ],
  "Business Analyst": [
    "Excel",
    "SQL",
    "Power BI",
    "Requirements Analysis",
    "Process Mapping",
    "Communication",
  ],
  "Software Developer": [
    "JavaScript",
    "Python",
    "Java",
    "React",
    "SQL",
    "Git",
  ],
  "Data Scientist": [
    "Python",
    "SQL",
    "Statistics",
    "Machine Learning",
    "Pandas",
    "Data Visualization",
  ],
  "Product Manager": [
    "Product Strategy",
    "User Research",
    "Analytics",
    "Roadmapping",
    "SQL",
    "Communication",
  ],
  "UI/UX Designer": [
    "Figma",
    "UX Research",
    "Wireframing",
    "Prototyping",
    "UI Design",
    "Design Systems",
  ],
  "Digital Marketer": [
    "SEO",
    "Content",
    "Google Ads",
    "Social Media",
    "Analytics",
    "Copywriting",
  ],
};

function mapGoal(value: string): Goal {
  if (value === "Find my first job") return "first-job";
  if (value === "Grow in my current career") return "grow";
  if (value === "Switch to a new career") return "switch";
  if (value === "Find international opportunities") return "international";
  return "unsure";
}

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
        });
      }
    } catch {
      // Ignore invalid local storage data
    }
  }, []);

  const questions = useMemo<Question[]>(() => {
    const result: Question[] = [
      {
        id: "goal",
        type: "single",
        title: "What brings you to CareerPilot?",
        description:
          "Choose what best describes what you need right now.",
        options: goalOptions,
        required: true,
      },
    ];

    if (data.goal === "grow" || data.goal === "switch") {
      result.push({
        id: "currentRole",
        type: "text",
        title: "What do you currently do?",
        description:
          "Tell us your current role so we can understand your starting point.",
        placeholder: "e.g. Marketing Executive",
        required: true,
      });
    }

    if (data.goal === "unsure") {
      result.push({
        id: "interests",
        type: "text",
        title: "What are you interested in?",
        description:
          "Tell us about the kind of work, subjects, or industries you enjoy.",
        placeholder: "e.g. Technology, business, data, design...",
        required: true,
      });
    }

    if (data.goal === "first-job" || data.goal === "unsure") {
      result.push({
        id: "education",
        type: "text",
        title: "What's your education background?",
        description:
          "This helps us understand your current qualification level.",
        placeholder: "e.g. BCA, B.Com, 12th, Diploma...",
        required: true,
      });
    }

    if (data.skills.length === 0) {
      result.push({
        id: "skills",
        type: "multi",
        title: "Which of these skills do you already have?",
        description:
          "Select everything you're comfortable with. You can select multiple.",
        options: ["SQL", "Excel", "Python", "Data Analysis", "Communication", "Problem Solving", "Programming", "Design"],
        required: false,
      });
    }

    result.push({
      id: "currentLocation",
      type: "text",
      title: "Where are you currently based?",
      description:
        "This is part of your professional profile, so CareerPilot can understand your starting point.",
      placeholder: "e.g. Delhi, India",
      required: true,
    });

    return result;
  }, [data.goal]);

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
    setData((previous) => ({
      ...previous,
      [currentQuestion.id]: value,
    }));
  };

  const selectSingle = (option: string) => {
    if (currentQuestion.id === "goal") {
      setData((previous) => ({
        ...previous,
        goal: mapGoal(option),
      }));

      if (!isLastQuestion) {
        setTimeout(() => {
          setStep((previous) => previous + 1);
        }, 160);
      }

      return;
    }

    updateValue(option);

    // Important:
    // The FINAL question does not automatically advance.
    // It shows the Continue button instead.
    if (!isLastQuestion) {
      setTimeout(() => {
        setStep((previous) => previous + 1);
      }, 160);
    }
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
    if (!hasValue() && currentQuestion.required) return;

    if (isLastQuestion) {
      try {
        localStorage.setItem(
          "careerpilot-dna",
          JSON.stringify(data),
        );
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

      const next: CareerState = {
        ...current,
        profile: {
          ...current.profile,
          currentLocation: data.currentLocation,
          education: data.education,
          currentRole: data.currentRole,
        },
        experience:
          data.goal === "grow" || data.goal === "switch"
            ? "Working professional"
            : "Early career",
        skills: data.skills,
      };

      saveCareerState(next);
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

            <span className="text-sm text-neutral-500">
              Complete
            </span>
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
                to understand where you're starting from.
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
                  onChange={(event) =>
                    updateValue(event.target.value)
                  }
                  placeholder={currentQuestion.placeholder}
                  className="h-14 w-full rounded-xl border border-neutral-200 bg-white px-4 text-[16px] outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                  autoFocus
                />
              </div>
            )}

            {currentQuestion.type === "single" &&
              currentQuestion.options && (
                <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {currentQuestion.options.map((option) => {
                    let selected = false;

                    selected =
                      currentQuestion.id === "goal"
                        ? data.goal === mapGoal(option)
                        : false;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => selectSingle(option)}
                        className={`min-h-12 rounded-xl border px-5 text-left text-[16px] transition ${
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

            {currentQuestion.type === "multi" &&
              currentQuestion.options && (
                <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {currentQuestion.options.map((option) => {
                    const selected =
                      Array.isArray(value) &&
                      value.includes(option);

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

            {(
              currentQuestion.type === "text" ||
              currentQuestion.type === "multi" ||
              isLastQuestion
            ) && (
              <button
                type="button"
                onClick={next}
                disabled={
                  currentQuestion.required && !hasValue()
                }
                className={`inline-flex h-11 items-center rounded-xl px-5 text-[15px] font-medium transition ${
                  currentQuestion.required && !hasValue()
                    ? "cursor-not-allowed bg-neutral-200 text-neutral-400"
                    : "bg-[#171717] text-white hover:bg-black"
                }`}
              >
                {isLastQuestion
                  ? "Finish Career DNA"
                  : "Continue"}
                <span className="ml-2">→</span>
              </button>
            )}
          </div>
        </footer>
      </div>
    </main>
  );
}
