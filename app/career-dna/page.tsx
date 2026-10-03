"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CareerState, loadCareerState, saveCareerState } from "../lib/career-state";

type QuestionType = "single" | "multi";

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

const roleOptions = [
  "Student",
  "Working professional",
  "Looking for my first job",
  "Career switcher",
  "Freelancer",
  "Self-employed",
  "Between jobs",
];

const educationOptions = [
  "10th / Secondary",
  "12th / Higher Secondary",
  "Diploma",
  "BCA",
  "B.Tech / BE",
  "B.Com",
  "BBA",
  "BA",
  "B.Sc",
  "MBA",
  "MCA",
  "Other degree",
];

const interestOptions = [
  "Data & Analytics",
  "Technology & Software",
  "AI & Machine Learning",
  "Finance & Business",
  "Marketing & Growth",
  "Product & Strategy",
  "Design & Creative",
  "Sales & Customer Success",
  "Healthcare",
  "Education",
  "Operations",
  "Consulting",
];

const skillOptions = [
  "SQL",
  "Excel",
  "Python",
  "Data Analysis",
  "Power BI",
  "Communication",
  "Problem Solving",
  "Programming",
  "Design",
  "Project Management",
  "Marketing",
  "Research",
];

const isPreset = (value: string, options: string[]) =>
  options.includes(value);

export default function CareerDNA() {
  const router = useRouter();

  const [data, setData] = useState<Data>(defaultData);
  const [step, setStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await fetch("/api/career-profile", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/auth");
            return;
          }
          throw new Error("Could not load Career DNA.");
        }

        const result = await response.json();
        const profile = result.profile;

        if (!cancelled && profile) {
          setData({
            currentRole: profile.currentRole ?? "",
            interests: profile.interests ?? "",
            education: profile.education ?? "",
            skills: Array.isArray(profile.skills) ? profile.skills : [],
          });
        }
      } catch {
        if (!cancelled) setSaveError("Could not load your Career DNA.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const questions = useMemo<Question[]>(
    () => [
      {
        id: "currentRole",
        type: "single",
        title: "What do you currently do?",
        description:
          "Tell us where you are professionally right now. You can choose an option or enter your specific role.",
        options: roleOptions,
        placeholder: "Or enter your current role, e.g. Data Analyst",
        required: true,
      },
      {
        id: "education",
        type: "single",
        title: "What's your education background?",
        description:
          "Choose your highest qualification or the education you're currently pursuing.",
        options: educationOptions,
        placeholder: "Or enter your qualification",
        required: true,
      },
      {
        id: "interests",
        type: "single",
        title: "What kind of work interests you?",
        description:
          "Choose the field or domain you want CareerPilot to understand better. You can also enter something more specific.",
        options: interestOptions,
        placeholder: "Or enter a specific field or domain",
        required: true,
      },
      {
        id: "skills",
        type: "multi",
        title: "Which skills do you already have?",
        description:
          "Select everything you already know. These are starting signals, not a final assessment.",
        options: skillOptions,
        required: false,
      },
    ],
    []
  );

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
      void saveCareerDNA();
      return;
    }

    setStep((previous) => previous + 1);
  };

  const saveCareerDNA = async () => {
    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch("/api/career-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Could not save Career DNA.");
      }

      setComplete(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Could not save Career DNA.");
    } finally {
      setSaving(false);
    }
  };

  const back = () => {
    if (step === 0) {
      router.push("/");
      return;
    }

    setStep((previous) => previous - 1);
  };

  const goToCareerGoal = () => {
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
    router.push("/career-goal");
  };

  if (loading) {
    return (
      <main className="min-h-[100svh] bg-[#07080d] text-[#f7f7fb]">
        <div className="mx-auto flex min-h-[100svh] max-w-2xl items-center justify-center px-6">
          <p className="text-sm text-[#9a9cab]">Loading your Career DNA...</p>
        </div>
      </main>
    );
  }

  if (complete) {
    return (
      <main className="min-h-[100svh] bg-[#07080d] text-[#f7f7fb]">
        <div className="mx-auto flex min-h-[100svh] max-w-2xl flex-col px-6 sm:px-8">
          <header className="flex items-center justify-between py-6">
            <button
              onClick={() => router.push("/")}
              className="text-[23px] font-bold tracking-[-0.04em]"
            >
              CareerPilot
            </button>

            <span className="text-sm text-[#9a9cab]">Complete</span>
          </header>

          {saveError && (
            <p className="mt-6 text-sm text-red-400">{saveError}</p>
          )}

          <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.08]">
            <div className="h-full w-full rounded-full bg-[#8b5cf6]" />
          </div>

          <section className="flex flex-1 flex-col justify-center py-16">
            <div className="max-w-xl">
              <p className="mb-4 text-[15px] font-medium text-[#9a9cab]">
                Career DNA
              </p>

              <h1 className="max-w-lg text-[42px] font-semibold leading-[1.04] tracking-[-0.045em] sm:text-[52px]">
                Your Career DNA is ready.
              </h1>

              <p className="mt-5 max-w-lg text-[17px] leading-7 text-[#9a9cab]">
                We have captured the professional context CareerPilot needs
                to understand your starting point.
              </p>

              <button
                disabled={saving}
                onClick={goToCareerGoal}
                className="mt-10 inline-flex h-12 items-center rounded-xl bg-white px-6 text-[15px] font-medium text-[#171717] transition hover:bg-[#f0eef5]"
              >
                {saving ? "Saving..." : "Define my Career Goal"}
                <span className="ml-2">→</span>
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!currentQuestion) return null;

  const value = getValue();
  const customValue =
    currentQuestion.type === "single" &&
    typeof value === "string" &&
    currentQuestion.options &&
    !isPreset(value, currentQuestion.options)
      ? value
      : "";

  return (
    <main className="min-h-[100svh] bg-[#07080d] text-[#f7f7fb]">
      <div className="mx-auto flex min-h-[100svh] max-w-2xl flex-col px-6 sm:px-8">
        <header className="flex items-center justify-between py-6">
          <button
            onClick={() => router.push("/")}
            className="text-[23px] font-bold tracking-[-0.04em]"
          >
            CareerPilot
          </button>

          <span className="text-sm text-[#9a9cab]">
            {step + 1} of {questions.length}
          </span>
        </header>

        <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-[#8b5cf6] transition-all duration-300"
            style={{
              width: `${((step + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <section className="flex-1 py-20 sm:py-24">
          <div className="mx-auto max-w-xl">
            <p className="mb-5 text-[15px] font-medium text-[#9a9cab]">
              Career DNA
            </p>

            <h1 className="max-w-xl text-[40px] font-semibold leading-[1.06] tracking-[-0.045em] sm:text-[50px]">
              {currentQuestion.title}
            </h1>

            {currentQuestion.description && (
              <p className="mt-4 max-w-lg text-[16px] leading-6 text-[#9a9cab]">
                {currentQuestion.description}
              </p>
            )}

            {currentQuestion.type === "single" && currentQuestion.options && (
              <>
                <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {currentQuestion.options.map((option) => {
                    const selected = value === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateValue(option)}
                        className={`min-h-12 rounded-xl border px-4 text-left text-[15px] transition ${
                          selected
                            ? "border-white bg-white text-[#171717]"
                            : "border-white/[0.10] bg-white/[0.035] text-[#f7f7fb] hover:border-white/[0.25] hover:bg-white/[0.06]"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5">
                  <input
                    type="text"
                    value={customValue}
                    onChange={(event) => updateValue(event.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="h-14 w-full rounded-xl border border-white/[0.10] bg-white/[0.035] px-4 text-[16px] text-[#f7f7fb] outline-none transition placeholder:text-[#6f7180] focus:border-[#8b5cf6] focus:bg-white/[0.05]"
                  />
                </div>
              </>
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
                      className={`min-h-12 rounded-xl border px-4 text-left text-[15px] transition ${
                        selected
                          ? "border-white bg-white text-[#171717]"
                          : "border-white/[0.10] bg-white/[0.035] text-[#f7f7fb] hover:border-white/[0.25] hover:bg-white/[0.06]"
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

        <footer className="border-t border-white/[0.08] py-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              className="text-[16px] text-[#9a9cab] transition hover:text-white"
            >
              Back
            </button>

            <button
              type="button"
              onClick={next}
              disabled={saving || (currentQuestion.required && !hasValue())}
              className={`inline-flex h-11 items-center rounded-xl px-5 text-[15px] font-medium transition ${
                currentQuestion.required && !hasValue()
                  ? "cursor-not-allowed bg-white/[0.08] text-[#555765]"
                  : "bg-white text-[#171717] hover:bg-[#f0eef5]"
              }`}
            >
              {saving ? "Saving..." : isLastQuestion ? "Finish Career DNA" : "Continue"}
              <span className="ml-2">→</span>
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
