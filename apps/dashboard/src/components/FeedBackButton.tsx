// apps/dashboard/src/components/FeedbackButton.tsx  (TEMPORARY — delete after testing)
export default function FeedbackButton() {
  const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdwQ5C7AWT80xYjou8JfGr0BF4lEHN-bk75KcOhFJflSgVTOg/viewform?usp=header';

  function openForm() {
    window.open(FORM_URL, '_blank');
  }

  return (
    <button
      onClick={openForm}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3 shadow-xl font-semibold text-white active:scale-95 transition"
      style={{ background: '#7B1113' }}
      title="Send testing feedback"
    >
      💬 Feedback
    </button>
  );
}