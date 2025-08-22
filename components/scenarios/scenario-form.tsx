"use client"

import { useFormState } from "react-dom"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save } from "lucide-react"
import { createScenario, updateScenario } from "@/lib/actions"
import { useState } from "react"
import React from "react"

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
  const [crisisType, setCrisisType] = useState(scenario?.crisis_type || "")
  const [difficultyLevel, setDifficultyLevel] = useState(scenario?.difficulty_level || "")
  const [title, setTitle] = useState(scenario?.title || "")
  const [description, setDescription] = useState(scenario?.description || "")
  const [estimatedDuration, setEstimatedDuration] = useState(scenario?.estimated_duration?.toString() || "")
  const [state, setState] = useState<{ error?: string; success?: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    console.log("Form submission started!")
    try {
      // Debug: Log form data
      console.log("Form data entries:")
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`)
      }
      
      console.log("Current state values:")
      console.log("Title:", title)
      console.log("Crisis Type:", crisisType)
      console.log("Difficulty Level:", difficultyLevel)
      console.log("Estimated Duration:", estimatedDuration)
      console.log("Description:", description)
      
      const action = mode === "create" ? createScenario : updateScenario
      console.log("Calling action:", mode === "create" ? "createScenario" : "updateScenario")
      const result = await action(null, formData)
      console.log("Action result:", result)
      setState(result)
      
      // Redirect to scenarios list after successful creation
      if (result.success && mode === "create") {
        setTimeout(() => {
          window.location.href = "/dashboard/scenarios"
        }, 1000)
      }
    } catch (error) {
      console.error("Form submission error:", error)
      setState({ error: "An unexpected error occurred" })
    }
  }

  return (
    <div className="max-w-2xl">
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
          <form action={handleSubmit} className="space-y-6">
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="crisisType" className="block text-sm font-medium text-gray-700 mb-2">
                  Crisis Type *
                </label>
                <select
                  id="crisisType"
                  name="crisisType"
                  value={crisisType}
                  onChange={(e) => setCrisisType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select crisis type</option>
                  <option value="cybersecurity">Cybersecurity Incident</option>
                  <option value="natural_disaster">Natural Disaster</option>
                  <option value="public_relations">Public Relations Crisis</option>
                  <option value="financial">Financial Crisis</option>
                  <option value="operational">Operational Disruption</option>
                  <option value="health_safety">Health & Safety</option>
                  <option value="legal_compliance">Legal & Compliance</option>
                </select>
                {crisisType && (
                  <p className="text-sm text-green-600 mt-1">Selected: {crisisType}</p>
                )}
              </div>

              <div>
                <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level *
                </label>
                <select
                  id="difficultyLevel"
                  name="difficultyLevel"
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                {difficultyLevel && (
                  <p className="text-sm text-green-600 mt-1">Selected: {difficultyLevel}</p>
                )}
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
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={() => {
                  console.log("Test button clicked!")
                  console.log("Form values:", { title, crisisType, difficultyLevel, estimatedDuration, description })
                }}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Test Form Values
              </Button>
              <SubmitButton mode={mode} />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
