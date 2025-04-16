export default function ConditionalDisplay({ children, condition }: { children: React.ReactNode, condition: boolean }) {
    return condition ? children : <></>;
}