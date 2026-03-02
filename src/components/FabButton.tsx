type Props = {
  onClick: () => void;
};

export default function FabButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-[#1a73e8] text-3xl shadow-lg"
    >
      +
    </button>
  );
}