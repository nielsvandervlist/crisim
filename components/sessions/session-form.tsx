"use client"


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Save, Users } from "lucide-react"
import { createTrainingSession, updateTrainingSession } from "@/lib/actions"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

interface SessionFormProps {
  scenarios: Array<{
    id: string
    title: string
    crisis_type: string
    difficulty_level: string
    estimated_duration: number
  }>
  members: Array<{
    user_id: string
    full_name: string
    email: string
    role: string
  }>
  initialScenarioId?: string
  initialTitle?: string
  initialStartTime?: string
  initialParticipants?: Array<{
    participant_id: string
    role_assignment: string
    status: string
    profiles?: {
      id: string
      full_name: string
      email: string
    }
  }>
  isEditing?: boolean
  sessionId?: string
}



export function SessionForm({ 
  scenarios, 
  members, 
  initialScenarioId, 
  initialTitle, 
  initialStartTime, 
  initialParticipants, 
  isEditing = false,
  sessionId 
}: SessionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  
  const [selectedScenario, setSelectedScenario] = useState(initialScenarioId || "")
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    initialParticipants?.map(p => p.participant_id) || []
  )
  const [participantRoles, setParticipantRoles] = useState<Record<string, string>>(
    initialParticipants?.reduce((acc, p) => ({
      ...acc,
      [p.participant_id]: p.role_assignment
    }), {}) || {}
  )

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("Form submit handler called!")
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      
      // Ensure the hidden inputs are updated with current state
      formData.set("participants", JSON.stringify(selectedParticipants))
      formData.set("participantRoles", JSON.stringify(participantRoles))
      
      // Debug logging
      console.log("Submitting form with participants:", selectedParticipants)
      console.log("Submitting form with roles:", participantRoles)
      console.log("Form data participants:", formData.get("participants"))
      console.log("Form data roles:", formData.get("participantRoles"))
      

      
      const action = isEditing ? updateTrainingSession : createTrainingSession
      const result = await action(null, formData)
      
      console.log("Action result:", result)
      
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        // Success - redirect to the session page
        if (isEditing) {
          router.push(`/dashboard/sessions/${sessionId}`)
        } else {
          router.push(`/dashboard/sessions/${result.sessionId}`)
        }
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error("Form submission error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedScenarioData = scenarios.find((s) => s.id === selectedScenario)
  // Show all members, not just participants, since admins and trainers can also participate
  const eligibleMembers = members
  


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Training Session" : "Create Training Session"}</CardTitle>
          <CardDescription>
            {isEditing ? "Update the crisis training session details" : "Set up a new crisis training session for your team"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
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
                  defaultValue={initialTitle}
                />
              </div>

              <div>
                <label htmlFor="scenarioId" className="block text-sm font-medium text-gray-700 mb-2">
                  Training Scenario *
                </label>
                <Select value={selectedScenario} onValueChange={setSelectedScenario} required>
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
                <input type="hidden" name="scenarioId" value={selectedScenario} />
                {!selectedScenario && (
                  <p className="text-sm text-red-600 mt-1">Please select a training scenario</p>
                )}
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time (Optional)
                </label>
                <Input 
                  id="startTime" 
                  name="startTime" 
                  type="datetime-local" 
                  className="w-full" 
                  defaultValue={initialStartTime ? initialStartTime.slice(0, 16) : undefined}
                />
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

            {/* Hidden inputs */}
            {isEditing && sessionId && (
              <input type="hidden" name="sessionId" value={sessionId} />
            )}
            <input type="hidden" name="participants" value={JSON.stringify(selectedParticipants)} />
            <input type="hidden" name="participantRoles" value={JSON.stringify(participantRoles)} />


            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedScenario} 
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating session..." : "Creating session..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Update Training Session" : "Create Training Session"}
                </>
              )}
            </Button>
            

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
                const isSelected = selectedParticipants.includes(member.user_id)

                return (
                  <div key={member.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleParticipantToggle(member.user_id, checked as boolean)}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{member.full_name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-48">
                        <Select
                          value={participantRoles[member.user_id] || ""}
                          onValueChange={(role) => handleRoleChange(member.user_id, role)}
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
