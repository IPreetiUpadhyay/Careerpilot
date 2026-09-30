"use client";

// Career DNA type-safe state mapping

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CareerGoalType, OpportunityScope, WorkMode, loadCareerState, saveCareerState } from "../lib/career-state";

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
  targetRole: string;
  interests: string;
  education: string;
  skills: string[];
  currentLocation: string;
  scope: Scope;
  preferredLocations: string[];
  internationalLocations: string[];
  workModes: string[];
  relocation: string;
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
  targetRole: "",
  interests: "",
  education: "",
  skills: [],
  currentLocation: "",
  scope: "",
  preferredLocations: [],
  internationalLocations: [],
  workModes: [],
  relocation: "",
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

const careerRoles = [
  "Data Analyst",
  "Business Analyst",
  "Software Developer",
  "Data Scientist",
  "Product Manager",
  "UI/UX Designer",
  "Digital Marketer",
  "Something else",
  "I'm not sure yet",
];

const indiaLocations = [
  "Delhi NCR",
  "Mumbai",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Remote India",
];

const internationalLocations = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "UAE",
  "Singapore",
  "Europe",
  "Anywhere",
];

const goalOptions = [
  "Find my first job",
  "Grow in my current career",
  "Switch to a new career",
  "Find international opportunities",
  "I'm not sure yet",
];

const scopeOptions = [
  "India",
  "International",
  "India + International",
  "Remote worldwide",
];

const workModeOptions = [
  "Remote",
  "Hybrid",
  "On-site",
  "Flexible",
];

function mapGoal(value: string): Goal {
  if (value === "Find my first job") return "first-job";
  if (value === "Grow in my current career") return "grow";
  if (value === "Switch to a new career") return "switch";
  if (value === "Find international opportunities") return "international";
  return "unsure";
}

function mapScope(value: string): Scope {
  if (value === "India") return "india";
  if (value === "International") return "international";
  if (value === "India + International") return "both";
  if (value === "Remote worldwide") return "remote";
  return "";
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
    } else {
      result.push({
        id: "targetRole",
        type: "single",
        title: "What kind of career are you looking for?",
        description:
          "You can change this later. This simply gives CareerPilot a starting direction.",
        options: careerRoles,
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

    if (
      data.targetRole &&
      roleSkills[data.targetRole]
    ) {
      result.push({
        id: "skills",
        type: "multi",
        title: "Which of these skills do you already have?",
        description:
          "Select everything you're comfortable with. You can select multiple.",
        options: roleSkills[data.targetRole],
        required: false,
      });
    }

    result.push({
      id: "currentLocation",
      type: "text",
      title: "Where are you currently based?",
      description:
        "We'll use this to personalize nearby and relevant opportunities.",
      placeholder: "e.g. Delhi, India",
      required: true,
    });

    result.push({
      id: "scope",
      type: "single",
      title: "Where do you want to find opportunities?",
      description:
        "Choose the opportunity market you want CareerPilot to search.",
      options: scopeOptions,
      required: true,
    });

    if (data.scope === "india" || data.scope === "both") {
      result.push({
        id: "preferredLocations",
        type: "multi",
        title: "Which locations in India interest you?",
        description:
          "Select all locations you'd consider working in.",
        options: indiaLocations,
        required: false,
      });
    }

    if (
      data.scope === "international" ||
      data.scope === "both" ||
      data.scope === "remote"
    ) {
      result.push({
        id: "internationalLocations",
        type: "multi",
        title: "Which international markets interest you?",
        description:
          "Select all that you'd consider.",
        options: internationalLocations,
        required: false,
      });
    }

    result.push({
      id: "workModes",
      type: "multi",
      title: "How would you prefer to work?",
      description:
        "Select all work arrangements you're open to.",
      options: workModeOptions,
      required: true,
    });

    if (
      data.scope === "international" ||
      data.scope === "both"
    ) {
      result.push({
        id: "relocation",
        type: "single",
        title: "Would you consider relocating?",
        description:
          "This helps us filter international opportunities.",
        options: ["Yes", "Maybe", "No"],
        required: true,
      });
    }

    return result;
  }, [data.goal, data.targetRole, data.scope]);

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

    if (currentQuestion.id === "targetRole") {
      setData((previous) => ({
        ...previous,
        targetRole: option,
      }));

      if (!isLastQuestion) {
        setTimeout(() => {
          setStep((previous) => previous + 1);
        }, 160);
      }

      return;
    }

    if (currentQuestion.id === "scope") {
      setData((previous) => ({
        ...previous,
        scope: mapScope(option),
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

      const goalType: CareerGoalType =
        data.goal === "first-job" ? "first-job" :
        data.goal === "grow" ? "grow" :
        data.goal === "switch" ? "switch" :
        data.goal === "international" ? "international" : "explore";

      const scope: OpportunityScope =
        data.scope === "india" ? "india" :
        data.scope === "international" ? "international" :
        data.scope === "both" ? "both" :
        data.scope === "remote" ? "remote-worldwide" : "india";

      const workModes: WorkMode[] = data.workModes.map((mode) =>
        mode === "Remote" ? "remote" :
        mode === "Hybrid" ? "hybrid" :
        mode === "On-site" ? "onsite" : "flexible"
      );

      const role =
        data.targetRole &&
        data.targetRole !== "Something else" &&
        data.targetRole !== "I'm not sure yet"
          ? data.targetRole
          : current.targetRole;

      const next = {
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
        targetRole: role,
        workMode: data.workModes.join(" · "),
        geography:
          data.scope === "india" ? "India" :
          data.scope === "international" ? "International" :
          data.scope === "both" ? "India + International" :
          "Remote worldwide",
        primaryGoal: {
          id: "primary-career-goal",
          role,
          type: goalType,
          seniority: data.goal === "grow" ? "Mid-level" : "Entry-level",
          scope,
          workModes,
          preferredLocations: [
            ...data.preferredLocations,
            ...data.internationalLocations,
          ],
          active: true,
          createdAt: current.primaryGoal?.createdAt ?? new Date().toISOString(),
        },
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
                We have enough information to start personalizing
                your career journey, opportunities, skills and next
                steps.
              </p>

              <button
                onClick={goToCareerGoal}
                className="mt-10 inline-flex h-12 items-center rounded-xl bg-[#171717] px-6 text-[15px] font-medium text-white transition hover:bg-black"
              >
                Continue to Career Goal
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

                    if (currentQuestion.id === "goal") {
                      selected =
                        data.goal === mapGoal(option);
                    } else if (
                      currentQuestion.id === "targetRole"
                    ) {
                      selected =
                        data.targetRole === option;
                    } else if (
                      currentQuestion.id === "scope"
                    ) {
                      selected =
                        data.scope === mapScope(option);
                    } else {
                      selected = data.relocation === option;
                    }

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
