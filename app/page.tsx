"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface WorkerInfo {
  workerType: string
  company: string
  name: string
  constructionCompany: string
  workType: string[]
}

interface HealthCheck {
  [key: string]: string
}

interface SecurityPledge {
  agreed: boolean
  privacyAgreed: boolean
}

export default function WorkerEducationForm() {
  const [currentStep, setCurrentStep] = useState<"info" | "safety" | "health" | "security" | "signature">("info")
  const [workerInfo, setWorkerInfo] = useState<WorkerInfo>({
    workerType: "",
    company: "",
    name: "",
    constructionCompany: "",
    workType: [],
  })

  const [showSafetyEducation, setShowSafetyEducation] = useState(false)
  const [healthCheck, setHealthCheck] = useState<HealthCheck>({})
  const [safetyEducationCompleted, setSafetyEducationCompleted] = useState(false)
  const [healthCheckCompleted, setHealthCheckCompleted] = useState(false)

  const [securityPledge, setSecurityPledge] = useState<SecurityPledge>({
    agreed: false,
    privacyAgreed: false,
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastX, setLastX] = useState(0)
  const [lastY, setLastY] = useState(0)

  const [bloodPressure, setBloodPressure] = useState({ systolic: "", diastolic: "" })
  const [otherNotes, setOtherNotes] = useState("")

  const canProceed = () => {
    if (currentStep === "info") {
      return workerInfo.workerType && workerInfo.workType.length > 0
    } else if (currentStep === "safety") {
      return safetyEducationCompleted
    } else if (currentStep === "health") {
      return healthCheckCompleted
    } else if (currentStep === "security") {
      return securityPledge.agreed && securityPledge.privacyAgreed
    }
    return false
  }

  const isWorkerInfoComplete = () => {
    const { workerType, company, name, constructionCompany, workType } = workerInfo
    return workerType && company && name && constructionCompany && workType.length > 0
  }

  const preWorkHealthItems = [
  "현재 질병을 앓고 있는가?",
  "작업 전 두통 및 어지러움은 있는가?",
  "현재 질병으로 인한 약물 복용 및 복용으로 인한 작업에 어려움은 있는가?",
  "작업 전 심장의 떨림 혹은 신체의 떨림은 있는가?",
  "혈압 수치는 양호한가?",
  "전날 음주를 하였는가?",
  "사고의 경험 및 사고 후유증으로 인해 작업에 어려움은 있는가?",
  "작업 전 적절한 작업복 및 보호구는 지급이 되었는가?",
  ]

  const postWorkHealthItems = [
  "작업 후 두통 혹은 어지러움은 있는가?",
  "작업 후 심장의 떨림 혹은 신체의 떨림이 심하게 발생하는가?",
  "작업 후 고열이 발생 하는가?",
  "작업 후 신체의 뻐근함 또는 아픈 곳이 있는가?",
  "작업 후 호흡이 답답하거나 심하게 거칠어 지는가?",
  "작업 후 신체의 상해가 발생 되었는가?",
]

  const allHealthItems = [...preWorkHealthItems, ...postWorkHealthItems]

  const workTypes = ["일반", "화기", "고소", "중장비", "정전", "밀폐", "굴착", "비파괴"]

  const handleInputChange = (field: keyof WorkerInfo, value: string) => {
    setWorkerInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleHealthCheck = (item: string, value: string) => {
    const updatedHealthCheck = { ...healthCheck, [item]: value }
    setHealthCheck(updatedHealthCheck)

    const allAnswered = allHealthItems.every(
      (item) =>
        updatedHealthCheck[item] && (updatedHealthCheck[item] === "양호" || updatedHealthCheck[item] === "이상"),
    )

    // 혈압 수치 입력 확인
    const bloodPressureValid = bloodPressure.systolic && bloodPressure.diastolic

    setHealthCheckCompleted(allAnswered && bloodPressureValid)
  }

  const handleWorkTypeChange = (workType: string, checked: boolean) => {
    setWorkerInfo((prev) => ({
      ...prev,
      workType: checked ? [...prev.workType, workType] : prev.workType.filter((type) => type !== workType),
    }))
  }

  const handleSafetyEducation = () => {
    if (!isWorkerInfoComplete()) {
      alert("작업자 정보를 모두 입력해주세요.")
      return
    }
    setShowSafetyEducation(!showSafetyEducation)
  }

  const handleNext = () => {
    if (currentStep === "info") {
      if (!canProceed()) {
        alert("작업자 유형과 작업종류를 선택해주세요.")
        return
      }
      setCurrentStep("safety")
      setShowSafetyEducation(true)
      setTimeout(() => window.scrollTo(0, 0), 100)
    } else if (currentStep === "safety") {
      if (!safetyEducationCompleted) {
        alert("안전교육을 먼저 완료해주세요.")
        return
      }

      if (workerInfo.workerType === "현장소장") {
        // 현재까지 진행한 모든 데이터를 저장
        localStorage.setItem("workerInfo", JSON.stringify(workerInfo))
        localStorage.setItem("safetyEducationCompleted", "true")
        localStorage.setItem("healthCheck", JSON.stringify(healthCheck))
        localStorage.setItem("bloodPressure", JSON.stringify(bloodPressure))
        localStorage.setItem("otherNotes", otherNotes)
        localStorage.setItem("securityPledge", JSON.stringify(securityPledge))

        setTimeout(() => {
          window.location.href = "/supervisor"
        }, 500)
        return
      }

      setCurrentStep("health")
      setTimeout(() => window.scrollTo(0, 0), 100)
    } else if (currentStep === "health") {
      if (!healthCheckCompleted) {
        alert("상세건강체크를 먼저 완료해주세요.")
        return
      }
      setCurrentStep("security")
      setTimeout(() => window.scrollTo(0, 0), 100)
    } else if (currentStep === "security") {
      if (!securityPledge.agreed || !securityPledge.privacyAgreed) {
        alert("보안서약서에 동의하고 개인정보 수집에 동의해주세요.")
        return
      }
      setCurrentStep("signature")
      setTimeout(() => window.scrollTo(0, 0), 100)
    }
  }

  const goBack = () => {
    if (currentStep === "signature") {
      setCurrentStep("security")
    } else if (currentStep === "security") {
      setCurrentStep("health")
    } else if (currentStep === "health") {
      setCurrentStep("safety")
    } else if (currentStep === "safety") {
      setCurrentStep("info")
      setShowSafetyEducation(false)
    }
    setTimeout(() => window.scrollTo(0, 0), 100)
  }

  const renderBottomContent = () => {
    if (currentStep === "safety") {
      return (
        <Card className="shadow-xl border-0 bg-white backdrop-blur-sm border-t-4 border-t-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-white">
            <CardTitle className="text-green-700 text-xl font-bold flex items-center gap-2">
              📋 창원물류센터 안전교육 자료
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-base text-green-600 mb-6 font-medium bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              작업 전 반드시 숙지해야 할 안전수칙입니다.
            </div>
            <div className="space-y-4">
              {safetyEducationItems.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border-l-4 border-green-500 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <p className="text-gray-700 font-medium leading-relaxed text-base">{item}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-white border-2 border-green-500 rounded-lg">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="safety-education-completed"
                  checked={safetyEducationCompleted}
                  onCheckedChange={handleSafetyEducationComplete}
                  className="border-green-500 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 w-5 h-5"
                />
                <Label htmlFor="safety-education-completed" className="cursor-pointer font-bold text-green-700 text-lg">
                  위 안전교육 내용을 모두 숙지했습니다.
                </Label>
              </div>
              <p className="text-green-600 text-sm mt-2 ml-8">✓ 체크 완료 후 다음 버튼을 눌러 진행하세요.</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (currentStep === "health") {
      return (
        <Card className="shadow-xl border-0 bg-white backdrop-blur-sm border-t-4 border-t-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-white">
            <CardTitle className="text-green-700 text-xl font-bold text-center">
              상세건강 Check List
              <div className="text-sm font-normal text-green-600 mt-1">(신규 인력 및 집중관리 대상자)</div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="font-bold text-gray-700">업체명:</Label>
                <Input
                  value={workerInfo.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  className="mt-1 border-gray-300"
                  readOnly
                />
              </div>
              <div>
                <Label className="font-bold text-gray-700">공사명:</Label>
                <Input
                  placeholder="공사명을 입력하세요"
                  className="mt-1 border-gray-300"
                  value={workerInfo.constructionCompany}
                  onChange={(e) => handleInputChange("constructionCompany", e.target.value)}
                />
              </div>
            </div>

            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-center font-bold text-sm">구분</th>
                    <th className="border border-gray-300 p-2 text-center font-bold text-sm">점검사항</th>
                    <th className="border border-gray-300 p-2 text-center font-bold text-sm w-24">상태</th>
                    <th className="border border-gray-300 p-2 text-center font-bold text-sm w-20">비고</th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-1 text-xs"></th>
                    <th className="border border-gray-300 p-1 text-xs"></th>
                    <th className="border border-gray-300 p-1 text-xs">
                      <div className="flex justify-center gap-2">
                        <span>양호</span>
                        <span>이상</span>
                      </div>
                    </th>
                    <th className="border border-gray-300 p-1 text-xs"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      rowSpan={preWorkHealthItems.length + 1}
                      className="border border-gray-300 p-2 text-center font-bold text-sm bg-gray-50 align-top"
                    >
                      작업전
                      <br />
                      체크리스트
                    </td>
                  </tr>
                  {preWorkHealthItems.map((item, index) => (
                    <tr key={`pre-${index}`}>
                      <td className="border border-gray-300 p-2 text-sm">
                        {item === "혈압 수치는 양호한가?" ? (
                          <div>
                            {item}
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs">혈압:</span>
                              <Input
                                value={bloodPressure.systolic}
                                onChange={(e) => handleBloodPressureChange("systolic", e.target.value)}
                                className="w-16 h-6 text-xs p-1"
                                placeholder="수축기"
                              />
                              <span>/</span>
                              <Input
                                value={bloodPressure.diastolic}
                                onChange={(e) => handleBloodPressureChange("diastolic", e.target.value)}
                                className="w-16 h-6 text-xs p-1"
                                placeholder="이완기"
                              />
                            </div>
                          </div>
                        ) : (
                          item
                        )}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <RadioGroup
                          value={healthCheck[item] || ""}
                          onValueChange={(value) => handleHealthCheck(item, value)}
                          className="flex justify-center gap-4"
                        >
                          <div className="flex items-center">
                            <RadioGroupItem
                              value="양호"
                              id={`pre-${index}-good`}
                              className="border-green-500 data-[state=checked]:bg-green-600"
                            />
                          </div>
                          <div className="flex items-center">
                            <RadioGroupItem
                              value="이상"
                              id={`pre-${index}-bad`}
                              className="border-red-500 data-[state=checked]:bg-red-600"
                            />
                          </div>
                        </RadioGroup>
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                  ))}

                  <tr>
                    <td
                      rowSpan={postWorkHealthItems.length + 1}
                      className="border border-gray-300 p-2 text-center font-bold text-sm bg-gray-50 align-top"
                    >
                      작업후
                      <br />
                      체크리스트
                    </td>
                  </tr>
                  {postWorkHealthItems.map((item, index) => (
                    <tr key={`post-${index}`}>
                      <td className="border border-gray-300 p-2 text-sm">{item}</td>
                      <td className="border border-gray-300 p-2 text-center">
                        <RadioGroup
                          value={healthCheck[item] || ""}
                          onValueChange={(value) => handleHealthCheck(item, value)}
                          className="flex justify-center gap-4"
                        >
                          <div className="flex items-center">
                            <RadioGroupItem
                              value="양호"
                              id={`post-${index}-good`}
                              className="border-green-500 data-[state=checked]:bg-green-600"
                            />
                          </div>
                          <div className="flex items-center">
                            <RadioGroupItem
                              value="이상"
                              id={`post-${index}-bad`}
                              className="border-red-500 data-[state=checked]:bg-red-600"
                            />
                          </div>
                        </RadioGroup>
                      </td>
                      <td className="border border-gray-300 p-2"></td>
                    </tr>
                  ))}

                  <tr>
                    <td className="border border-gray-300 p-2 font-bold text-sm bg-gray-100">기타사항</td>
                    <td colSpan={3} className="border border-gray-300 p-2">
                      <textarea
                        value={otherNotes}
                        onChange={(e) => setOtherNotes(e.target.value)}
                        className="w-full h-16 p-2 border border-gray-200 rounded text-sm resize-none"
                        placeholder="기타 특이사항이 있으면 기재해주세요"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 border-2 border-dashed border-gray-400 rounded-lg bg-gray-50">
              <p className="text-xs text-gray-600 leading-relaxed">
                ※ '상세건강 Check List' 작성으로 인해 발생하는 개인정보 수집 이용 제공에 대한 개별 사항(보호조치 포함)은
                별도 동의서를 통해 '개인정보 수집·이용·제공 동의서'에 '상세건강 Check List' 상의 민감정보 수집 및 이용에
                제공에 대한 사전동의를 받아 처리하게 됩니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (currentStep === "security") {
      return (
        <Card className="shadow-xl border-0 bg-white backdrop-blur-sm border-t-4 border-t-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-white">
            <CardTitle className="text-green-700 text-xl font-bold">보안서약서</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="affiliation">소속</Label>
                <Input id="affiliation" value={workerInfo.company} readOnly className="bg-gray-100" />
              </div>
              <div>
                <Label htmlFor="construction">공사명</Label>
                <Input id="construction" value={workerInfo.constructionCompany} readOnly className="bg-gray-100" />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded mb-4 text-sm leading-relaxed">
              <p className="text-blue-800 mb-2">
                위 본인 및 당사는 GS칼텍스 창원물류센터의 상기 공사의 참여 및 관련업무를 수행함에 있어 상호 신뢰를
                바탕으로 GS칼텍스의 정보 및 비밀 보호를 위해 아래 사항을 성실히 준수할 것을 서약합니다.
              </p>
              <p className="text-blue-800 mb-2">{""}</p>

              <div className="mt-4 space-y-2">
                <p>
                  1. 사업수행 기간을 포함 종료후에도 GS칼텍스의 비밀정보(비밀,대외비 및 이에 준하는 모든 사항) 및 정보를
                  어떤 사람에게도 직·간접적으로 유출 또는 누설하지 않겠음.{" "}
                </p>
                <p className="ml-4">{""}</p>

                <p>
                  2. 사업을 이행하는 과정에서 얻은 GS칼텍스의 어떠한 비밀 또는 정보라도 사업수행 목적에만 사용하고 그
                  외에는 유출,누설, 손상하지 않겠음.{" "}
                </p>
                <p className="ml-4">{""}</p>

                <p>
                  3. 본 사업 수행과 관련하여 당사에서 제공한 근로자가 GS칼텍스의 보안규정에 관한 모든 사항을 철저히
                  준수하도록 관리하고, 비밀 유출 및 사진/동영상 촬영 등 일체의 보안사고가 발생하지 않도록 관리하겠음.{" "}
                </p>
                <p className="ml-4">{""}</p>
                <p className="ml-4">{""}</p>
              </div>

              <div className="mt-6 text-center bg-white p-3 rounded border">
                <p>위와 같이 GS칼텍스 물류센터가 국가보안시설 및 위험물 시설임을 항상 인지하고,</p>
                <p>
                  {
                    "만약 서약 사항을 위반하였을 경우에는 법이 정한 바에 따라 민·형사상의 책임을 감수함은 물론, GS칼텍스에 손해를 끼친 경우에는 해당 손해액을 지체 없이 변상할 것을 약속합니다."
                  }
                </p>
                <p>{""}</p>
              </div>

              <div className="mt-4 text-right">
                <p>GS칼텍스주식회사 대표이사 귀하</p>
              </div>
            </div>

            <div className="mb-4">
              <Label className="text-sm font-medium">위 보안서약서 내용에 동의하십니까?</Label>
              <RadioGroup
                value={securityPledge.agreed ? "yes" : "no"}
                onValueChange={(value) => setSecurityPledge((prev) => ({ ...prev, agreed: value === "yes" }))}
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" className="border-green-500 data-[state=checked]:bg-green-600" />
                  <Label className="cursor-pointer font-medium text-green-700">예</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" className="border-red-500 data-[state=checked]:bg-red-600" />
                  <Label className="cursor-pointer font-medium text-red-700">아니오</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="border-2 border-dashed border-gray-400 p-4 bg-gray-50 mb-4">
              <div className="text-xs leading-relaxed space-y-2">
                <p className="font-bold">
                  ※ '보안서약서' 작성으로 인해 발생하는 개인정보 수집·이용·제공에 대한 개별 사항(보호조치 포함)은 별도
                </p>
                <p className="ml-4">
                  고지를 통해 안내하며, 위 개인정보 수집·이용·제공에 대한 개인정보 수집 이용 제공에 대한
                </p>
                <p className="ml-4">사전동의는 별도 작성한 개인정보 수집 이용 제공 동의서에 의합니다.</p>
              </div>

              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="security-privacy-agreement"
                    checked={securityPledge.privacyAgreed}
                    onCheckedChange={(checked) => setSecurityPledge((prev) => ({ ...prev, privacyAgreed: !!checked }))}
                    className="border-green-500 data-[state=checked]:bg-green-600"
                  />
                  <Label htmlFor="security-privacy-agreement" className="cursor-pointer text-xs font-medium">
                    개인정보 수집·이용·제공에 동의합니다
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (currentStep === "signature") {
      return (
        <>
          <Card className="mb-6 shadow-xl border-0 bg-white border-t-4 border-t-green-500">
            <CardHeader className="bg-gradient-to-r from-green-50 to-white">
              <CardTitle className="text-green-700 font-bold">작업자 정보 확인</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-green-700">업체명:</strong>{" "}
                  <span className="font-medium text-gray-800">{workerInfo.company}</span>
                </div>
                <div>
                  <strong className="text-green-700">성명:</strong>{" "}
                  <span className="font-medium text-gray-800">{workerInfo.name}</span>
                </div>
                <div>
                  <strong className="text-green-700">공사명:</strong>{" "}
                  <span className="font-medium text-gray-800">{workerInfo.constructionCompany}</span>
                </div>
                <div>
                  <strong className="text-green-700">작업종류:</strong>{" "}
                  <span className="font-medium text-gray-800">{workerInfo.workType.join(", ")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white backdrop-blur-sm border-t-4 border-t-green-500">
            <CardHeader className="bg-gradient-to-r from-green-50 to-white">
              <CardTitle className="text-green-700 text-xl font-bold">서명해주세요</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-base text-green-600 mb-4 font-medium bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                아래 서명란에 서명을 해주세요. 터치나 마우스로 서명할 수 있습니다.
              </div>

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
        </>
      )
    }

    return null
  }

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return [0, 0]

    const rect = canvas.getBoundingClientRect()
    let x, y

    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
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
    if (canvas) {
      const signatureData = canvas.toDataURL()

      const existingRecords = JSON.parse(localStorage.getItem("signatureRecords") || "[]")
      const newRecord = {
        ...workerInfo,
        role: workerInfo.workerType === "현장소장" ? "현장소장" : "현장작업자",
        signature: signatureData,
        timestamp: new Date().toISOString(),
        healthCheck: healthCheck,
        bloodPressure: bloodPressure,
        otherNotes: otherNotes,
        securityPledge: securityPledge,
      }
      existingRecords.push(newRecord)
      localStorage.setItem("signatureRecords", JSON.stringify(existingRecords))

      localStorage.removeItem("workerInfo")
      localStorage.removeItem("healthCheck")

      alert("안전교육 이수가 완료되었습니다.")
      window.location.href = "/"
    }
  }

  const handleSafetyEducationComplete = (checked: boolean) => {
    setSafetyEducationCompleted(checked)
  }

  const handleBloodPressureChange = (type: "systolic" | "diastolic", value: string) => {
    const updatedBloodPressure = { ...bloodPressure, [type]: value }
    setBloodPressure(updatedBloodPressure)

    // 모든 건강체크 항목이 응답되었는지 확인
    const allAnswered = allHealthItems.every(
      (item) => healthCheck[item] && (healthCheck[item] === "양호" || healthCheck[item] === "이상"),
    )

    // 혈압 수치가 모두 입력되었는지 확인
    const bloodPressureValid = updatedBloodPressure.systolic && updatedBloodPressure.diastolic

    setHealthCheckCompleted(allAnswered && bloodPressureValid)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 2
        ctx.lineCap = "round"
      }
    }
  }, [currentStep])

  const getCurrentPageNumber = () => {
    switch (currentStep) {
      case "info":
        return 1
      case "safety":
        return 2
      case "health":
        return 3
      case "security":
        return 4
      case "signature":
        return 5
      default:
        return 1
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 text-center shadow-xl relative">
        <div className="flex flex-col items-center mb-2">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-lg">
            <span className="text-green-600 font-bold text-xl">GS</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">GS칼텍스</h1>
          <p className="text-lg text-green-100 font-medium">창원물류센터</p>
        </div>
        <div className="absolute bottom-4 right-6 text-green-100 text-sm font-medium italic">I am your safety</div>
      </div>

      <div className="bg-white border-b-4 border-green-500 text-green-700 p-4 text-center text-lg font-bold shadow-sm">
        신규 작업자 교육
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <Alert className="mb-6 border-l-4 border-l-green-500 bg-green-50 backdrop-blur-sm shadow-sm">
          <AlertTriangle className="h-4 w-4 text-green-600" />
          <AlertDescription className="font-semibold">
            <span className="block font-bold text-base mb-1 text-green-700">⚠️ 주의사항</span>
            <span className="text-green-600">모든 작업자는 작업 전 반드시 안전교육을 이수해야 합니다.</span>
          </AlertDescription>
        </Alert>

        {currentStep === "info" && (
          <Card className="shadow-xl border-0 bg-white backdrop-blur-sm border-t-4 border-t-green-500 mb-6">
            <CardHeader className="bg-gradient-to-r from-green-50 to-white">
              <CardTitle className="text-green-700 text-xl font-bold">작업자 정보 입력</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-3">
                <Label className="text-base font-bold text-gray-700">작업자 유형</Label>
                <RadioGroup
                  value={workerInfo.workerType}
                  onValueChange={(value) => handleInputChange("workerType", value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="현장소장"
                      id="supervisor"
                      className="border-green-500 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <Label htmlFor="supervisor" className="cursor-pointer font-medium text-gray-700">
                      현장소장
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="신규작업자"
                      id="newWorker"
                      className="border-green-500 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    <Label htmlFor="newWorker" className="cursor-pointer font-medium text-gray-700">
                      신규작업자
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-base font-bold text-gray-700">
                  업체명
                </Label>
                <Input
                  id="company"
                  value={workerInfo.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  className="text-base p-3 focus:border-green-500 focus:ring-green-500/20 border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-bold text-gray-700">
                  성명
                </Label>
                <Input
                  id="name"
                  value={workerInfo.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="text-base p-3 focus:border-green-500 focus:ring-green-500/20 border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="constructionCompany" className="text-base font-bold text-gray-700">
                  공사명
                </Label>
                <Input
                  id="constructionCompany"
                  value={workerInfo.constructionCompany}
                  onChange={(e) => handleInputChange("constructionCompany", e.target.value)}
                  className="text-base p-3 focus:border-green-500 focus:ring-green-500/20 border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-bold text-gray-700">
                  작업종류 <span className="text-sm text-gray-500">(중복선택 가능)</span>
                </Label>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
                  {workTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-3">
                      <Checkbox
                        id={`work-${type}`}
                        checked={workerInfo.workType.includes(type)}
                        onCheckedChange={(checked) => handleWorkTypeChange(type, checked as boolean)}
                        className="border-green-500 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <Label htmlFor={`work-${type}`} className="cursor-pointer font-medium text-gray-700 text-base">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
                {workerInfo.workType.length > 0 && (
                  <div className="text-sm text-green-600 bg-green-50 p-2 rounded border-l-4 border-green-500">
                    선택된 작업종류: {workerInfo.workType.join(", ")}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`w-full p-4 text-lg font-semibold rounded-lg transition-all duration-300 ${
                    !canProceed()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                  }`}
                >
                  다음
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {renderBottomContent()}

        {currentStep !== "info" && (
          <div className="mt-6 flex gap-4">
            <Button
              onClick={goBack}
              variant="outline"
              className="flex-1 border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white p-4 text-base transition-all duration-300 font-medium rounded-lg bg-transparent"
            >
              이전
            </Button>
            {currentStep !== "signature" && (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex-1 p-4 text-base font-semibold rounded-lg transition-all duration-300 ${
                  !canProceed()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                }`}
              >
                다음
              </Button>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <div className="inline-flex items-center justify-center bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium text-sm shadow-sm">
            <span className="font-bold">{getCurrentPageNumber()}</span>
            <span className="mx-1">/</span>
            <span>5</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const safetyEducationItems = [
  "비상상황 시 창원물류센터 1차집결지는 경비대입니다.",
  "흡연은 물류센터 입구 근처 외부 흡연장소에서만 할 수 있습니다.",
  "세안,비상 세척설비는 신 출하대 앞쪽에 있습니다.",
  "물류센터 차량 이동 시 운행속도는 15km/h 이내이며, 출하대 근처 이동 시 방향은 반시계 방향입니다.",
  "물류센터 내에서 차량 후진 시 창문을 열고, 항상 보행자의 유무를 살피며 천천히 합니다.",
  "자동심장충격기는 운영사무실 1층 휴게실 앞쪽에 있습니다.",
  "물류센터에서 안전모, 보안경, 안전화는 필히 착용해야 하는 보호구입니다.",
  "작업 중 안전규정을 위반하였을 시 공사감독자에 의해 LSGR위반으로 인한 패널티를 받을 수 있습니다.",
]
