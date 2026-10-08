interface StepHeadingProps {
  title: string
  description: string
}

export function StepHeading({ title, description }: StepHeadingProps) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-lg font-bold text-text-primary">{title}</h2>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
  )
}
