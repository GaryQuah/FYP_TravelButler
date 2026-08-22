import { useEffect, useState } from "react";
import "../assets/css/WelcomeTypewriter.css";

interface WelcomeTypewriterProps {
  phrases?: string[];
}

const defaultPhrases = [
  "Welcome Back",
  "欢迎回来",
  "ようこそ",
  "환영합니다",
  "Selamat Datang",
  "Xin chào",
  "Bienvenue",
  "Willkommen",
  "Bienvenido",
  "Benvenuto",
];

export default function WelcomeTypewriter({
  phrases = defaultPhrases,
}: WelcomeTypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [languageIndex, setLanguageIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = phrases[languageIndex];

    let timeout: ReturnType<typeof setTimeout>;

    // Typing
    if (!deleting && displayText.length < word.length) {
      timeout = setTimeout(() => {
        setDisplayText(word.slice(0, displayText.length + 1));
      }, 90);
    }

    // Pause after typing
    else if (!deleting && displayText.length === word.length) {
      timeout = setTimeout(() => {
        setDeleting(true);
      }, 2200);
    }

    // Deleting
    else if (deleting && displayText.length > 0) {
      timeout = setTimeout(() => {
        setDisplayText(word.slice(0, displayText.length - 1));
      }, 40);
    }

    // Next language
    else {
      setDeleting(false);
      setLanguageIndex((prev) => (prev + 1) % phrases.length);
    }

    return () => clearTimeout(timeout);
  }, [displayText, deleting, languageIndex]);

  return (
    <span className="typewriter">
      {displayText}
      <span className="cursor">|</span>
    </span>
  );
}
