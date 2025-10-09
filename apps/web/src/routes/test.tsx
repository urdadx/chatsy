import { AppointmentPicker } from '@/components/appointment-picker'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='w-fit p-6 max-w-lg min-h-screen justify-center mx-auto'>

    <AppointmentPicker />
  </div>
}
