import { OnboardingPageViewModel } from "../viewmodels/OnboardingPageViewModel";

export function OnboardingPage() {
  const { name, setName, handleContinue } = OnboardingPageViewModel();

  return (
    <div className="onboarding-container">
      <h1>Welcome!</h1>
      <p>What should we call you?</p>

      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={handleContinue}>Continue</button>
    </div>
  );
}
