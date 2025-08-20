"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save } from "lucide-react"
import { createScenario, updateScenario } from "@/lib/actions"
import { useState } from "react"

interface ScenarioFormProps {
  scenario?: {
    id: string
    title: string
    description: string
    crisis_type: string
    difficulty_level: string
    estimated_duration: number
  }
  mode: "create" | "edit"
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {mode === "create" ? "Creating..." : "Updating..."}
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          {mode === "create" ? "Create Scenario" : "Update Scenario"}
        </>
      )}
    </Button>
  )
}

export function ScenarioForm({ scenario, mode }: ScenarioFormProps) {
  const [state, formAction] = useActionState(mode === "create" ? createScenario : updateScenario, null)
  const [crisisType, setCrisisType] = useState(scenario?.crisis_type || "")
  const [difficultyLevel, setDifficultyLevel] = useState(scenario?.difficulty_level || "")

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Scenario" : "Edit Scenario"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Design a crisis scenario for your team to practice with"
            : "Update the scenario details and settings"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {scenario && <input type="hidden" name="scenarioId" value={scenario.id} />}

          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              {state.success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Scenario Title *
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="e.g., Data Breach Response Training"
                defaultValue={scenario?.title}
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="crisisType" className="block text-sm font-medium text-gray-700 mb-2">
                Crisis Type *
              </label>
              <Select name="crisisType" value={crisisType} onValueChange={setCrisisType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select crisis type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cybersecurity">Cybersecurity Incident</SelectItem>
                  <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
                  <SelectItem value="public_relations">Public Relations Crisis</SelectItem>
                  <SelectItem value="financial">Financial Crisis</SelectItem>
                  <SelectItem value="operational">Operational Disruption</SelectItem>
                  <SelectItem value="health_safety">Health & Safety</SelectItem>
                  <SelectItem value="legal_compliance">Legal & Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level *
              </label>
              <Select name="difficultyLevel" value={difficultyLevel} onValueChange={setDifficultyLevel} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (minutes) *
              </label>
              <Input
                id="estimatedDuration"
                name="estimatedDuration"
                type="number"
                min="15"
                max="480"
                placeholder="90"
                defaultValue={scenario?.estimated_duration}
                required
                className="w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Scenario Description *
              </label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Describe the crisis scenario, including the initial situation, key stakeholders, and objectives for the training session..."
                defaultValue={scenario?.description}
                required
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <SubmitButton mode={mode} />
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
