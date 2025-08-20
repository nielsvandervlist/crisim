"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Save, Users } from "lucide-react"
import { createTrainingSession } from "@/lib/actions"
import { useState } from "react"

interface SessionFormProps {
  scenarios: Array<{
    id: string
    title: string
    crisis_type: string
    difficulty_level: string
    estimated_duration: number
  }>
  members: Array<{
    id: string
    full_name: string
    email: string
    role: string
  }>
  initialScenarioId?: string
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="bg-green-600 hover:bg-green-700">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating session...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Create Training Session
        </>
      )}
    </Button>
  )
}

export function SessionForm({ scenarios, members, initialScenarioId }: SessionFormProps) {
  const [state, formAction] = useActionState(createTrainingSession, null)
  const [selectedScenario, setSelectedScenario] = useState(initialScenarioId || "")
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [participantRoles, setParticipantRoles] = useState<Record<string, string>>({})

  const handleParticipantToggle = (participantId: string, checked: boolean) => {
    if (checked) {
      setSelectedParticipants([...selectedParticipants, participantId])
    } else {
      setSelectedParticipants(selectedParticipants.filter((id) => id !== participantId))
      const newRoles = { ...participantRoles }
      delete newRoles[participantId]
      setParticipantRoles(newRoles)
    }
  }

  const handleRoleChange = (participantId: string, role: string) => {
    setParticipantRoles({
      ...participantRoles,
      [participantId]: role,
    })
  }

  const selectedScenarioData = scenarios.find((s) => s.id === selectedScenario)
  const eligibleMembers = members.filter((m) => m.role === "participant")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Training Session</CardTitle>
          <CardDescription>Set up a new crisis training session for your team</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {state.error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Session Title *
                </label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., Q1 Crisis Response Training"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="scenarioId" className="block text-sm font-medium text-gray-700 mb-2">
                  Training Scenario *
                </label>
                <Select name="scenarioId" value={selectedScenario} onValueChange={setSelectedScenario} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios.map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.title} ({scenario.crisis_type.replace("_", " ")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time (Optional)
                </label>
                <Input id="startTime" name="startTime" type="datetime-local" className="w-full" />
              </div>
            </div>

            {selectedScenarioData && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-900 mb-2">Selected Scenario Details</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>
                    <span className="font-medium">Type:</span> {selectedScenarioData.crisis_type.replace("_", " ")}
                  </p>
                  <p>
                    <span className="font-medium">Difficulty:</span> {selectedScenarioData.difficulty_level}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span> {selectedScenarioData.estimated_duration} minutes
                  </p>
                </div>
              </div>
            )}

            {/* Hidden input for selected participants */}
            <input type="hidden" name="participants" value={JSON.stringify(selectedParticipants)} />
            <input type="hidden" name="participantRoles" value={JSON.stringify(participantRoles)} />

            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      {/* Participant Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Select Participants
          </CardTitle>
          <CardDescription>Choose team members to participate in this training session</CardDescription>
        </CardHeader>
        <CardContent>
          {eligibleMembers.length > 0 ? (
            <div className="space-y-4">
              {eligibleMembers.map((member) => {
                const isSelected = selectedParticipants.includes(member.id)

                return (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleParticipantToggle(member.id, checked as boolean)}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{member.full_name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-48">
                        <Select
                          value={participantRoles[member.id] || ""}
                          onValueChange={(role) => handleRoleChange(member.id, role)}
                        >
                          <SelectTrigger size="sm">
                            <SelectValue placeholder="Assign role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Crisis Manager">Crisis Manager</SelectItem>
                            <SelectItem value="Communications Lead">Communications Lead</SelectItem>
                            <SelectItem value="Technical Lead">Technical Lead</SelectItem>
                            <SelectItem value="Legal Advisor">Legal Advisor</SelectItem>
                            <SelectItem value="HR Representative">HR Representative</SelectItem>
                            <SelectItem value="Operations Manager">Operations Manager</SelectItem>
                            <SelectItem value="Observer">Observer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                No participants available. Invite team members to join your organization first.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
