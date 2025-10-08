"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WorkerInfo {
  workerType: string
  company: string
  name: string
  phone: string
  workType: string
}

export default function SignaturePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [workerInfo, setWorkerInfo] = useState<WorkerInfo | null>(null)
  const [lastX, setLastX] = useState(0)
  const [lastY, setLastY] = useState(0)

  useEffect(() => {
    // Load worker info from localStorage
    const savedInfo = localStorage.getItem("workerInfo")
    if (savedInfo) {
      setWorkerInfo(JSON.parse(savedInfo))
    }

    // Initialize canvas
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 2
        ctx.lineCap = "round"
      }
    }
  }, [])

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return [0, 0]

    const rect = canvas.getBoundingClientRect()
    let x, y

    if ("touches" in e) {
      // Touch event
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      // Mouse event
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    return [x, y]
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const [x, y] = getCoordinates(e)
    setLastX(x)
    setLastY(y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    e.preventDefault()

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        const [x, y] = getCoordinates(e)
        ctx.beginPath()
        ctx.moveTo(lastX, lastY)
        ctx.lineTo(x, y)
        ctx.stroke()
        setLastX(x)
        setLastY(y)
      }
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (canvas && workerInfo) {
      const signatureData = canvas.toDataURL()

      const savedHealthCheck = localStorage.getItem("healthCheck")
      const healthCheckData = savedHealthCheck ? JSON.parse(savedHealthCheck) : null

      const existingRecords = JSON.parse(localStorage.getItem("signatureRecords") || "[]")
      const newRecord = {
        ...workerInfo,
        role: "현장작업자",
        signature: signatureData,
        timestamp: new Date().toISOString(),
        healthCheck: healthCheckData,
      }
      existingRecords.push(newRecord)
      localStorage.setItem("signatureRecords", JSON.stringify(existingRecords))

      localStorage.removeItem("healthCheck")

      alert("안전교육 이수가 완료되었습니다.")
      window.location.href = "/"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 text-center shadow-xl">
        <div className="flex flex-col items-center mb-2">
          <h1 className="text-2xl font-bold mb-1">GS칼텍스</h1>
          <p className="text-lg text-green-100 font-medium">창원물류센터</p>
        </div>
      </div>

      {/* Sub Header */}
      <div className="bg-white border-b-4 border-green-500 text-green-700 p-4 text-center text-lg font-bold shadow-sm">
        안전교육 서명
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-6">
        {workerInfo && (
          <Card className="mb-6 shadow-xl border-0 bg-white border-t-4 border-t-green-500">
            <CardHeader className="bg-gradient-to-r from-green-50 to-white">
              <CardTitle className="text-green-700 font-bold">작업자 정보</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-green-700">소속회사:</strong>{" "}
                  <span className="font-medium text-gray-800">{workerInfo.company}</span>
                </div>
                <div>
                  <strong className="text-green-700">성명:</strong>{" "}
                  <span className="font-medium text-gray-800">{workerInfo.name}</span>
                </div>
                <div>
                  <strong className="text-green-700">연락처:</strong>{" "}
                  <span className="font-medium text-gray-800">{workerInfo.phone}</span>
                </div>
                <div>
                  <strong className="text-green-700">작업종류:</strong>{" "}
                  <span className="font-medium text-gray-800">{workerInfo.workType}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-xl border-0 bg-white border-t-4 border-t-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-white">
            <CardTitle className="text-green-700 font-bold">서명해주세요</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="border-2 border-green-300 rounded-xl mb-5 bg-white shadow-inner">
              <canvas
                ref={canvasRef}
                width={700}
                height={200}
                className="w-full cursor-crosshair rounded-xl"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={clearSignature}
                variant="outline"
                className="flex-1 border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white font-medium transition-all duration-300 bg-transparent rounded-lg"
              >
                다시 서명
              </Button>
              <Button
                onClick={saveSignature}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 font-semibold shadow-lg transition-all duration-300 rounded-lg"
              >
                제출하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
