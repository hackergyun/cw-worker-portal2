"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { preWorkHealthItems, postWorkHealthItems } from "@/app/constants/healthItems"
import { infoProvisionItems } from "@/app/constants/infoProvisionItems"

interface HealthCheck {
  [key: string]: string
}

interface SecurityPledge {
  agreed: boolean
  affiliation: string
  constructionName: string
  privacyAgreed: boolean
}

interface InfoProvision {
  companyName: string
  targetWork: string
  date: string
  privacyAgreed: boolean
}

interface SafetyPledge {
  agreed: boolean
  privacyAgreed: boolean
}

interface WorkAgreement {
  workerSafetyItems: Array<{ affiliation: string; name: string }>
  workContent: string
  workPeriodStart: string
  workPeriodEnd: string
  privacyAgreed: boolean
}

interface SupervisorRecord {
  workerInfo: any
  healthCheck: HealthCheck
  securityPledge: SecurityPledge
  infoProvision: InfoProvision
  safetyPledge: SafetyPledge
  workAgreement: WorkAgreement
  bloodPressure: { systolic: string; diastolic: string }
  signature: string
  timestamp: string
}

export default function SupervisorPage() {
  const [currentTab, setCurrentTab] = useState("health")
  const [healthCheck, setHealthCheck] = useState<HealthCheck>({})
  const [securityPledge, setSecurityPledge] = useState<SecurityPledge>({
    agreed: false,
    affiliation: "",
    constructionName: "",
    privacyAgreed: false,
  })
  const [infoProvision, setInfoProvision] = useState<InfoProvision>({
    companyName: "",
    targetWork: "",
    date: "",
    privacyAgreed: false,
  })
  const [safetyPledge, setSafetyPledge] = useState<SafetyPledge>({
    agreed: false,
    privacyAgreed: false,
  })
  const [workAgreement, setWorkAgreement] = useState<WorkAgreement>({
    workerSafetyItems: Array(6)
      .fill(null)
      .map(() => ({ affiliation: "", name: "" })),
    workContent: "",
    workPeriodStart: "",
    workPeriodEnd: "",
    privacyAgreed: false,
  })
  const [signature, setSignature] = useState("")
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [bloodPressure, setBloodPressure] = useState({ systolic: "", diastolic: "" })
  const [otherNotes, setOtherNotes] = useState("")
  const [workerInfo, setWorkerInfo] = useState<any>({})
  const [completedSteps, setCompletedSteps] = useState({
    health: false,
    security: false,
    info: false,
    safety: false,
    work: false,
  })

  useEffect(() => {
    const workerInfo = JSON.parse(localStorage.getItem("workerInfo") || "{}")
    const currentDate = new Date()
    const formattedDate = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일`

    console.log("[v0] 현장소장 페이지 - workerInfo:", workerInfo)
    console.log("[v0] company:", workerInfo.company, "constructionCompany:", workerInfo.constructionCompany)

    setWorkerInfo(workerInfo)
    setSecurityPledge((prev) => ({
      ...prev,
      affiliation: workerInfo.company || "",
      constructionName: workerInfo.constructionCompany || "",
    }))
    setInfoProvision((prev) => ({
      ...prev,
      companyName: workerInfo.company || "",
      targetWork: workerInfo.constructionCompany || "",
      date: formattedDate,
    }))

    setWorkAgreement((prev) => {
      const newWorkerSafetyItems = [...prev.workerSafetyItems]
      newWorkerSafetyItems[0] = {
        affiliation: workerInfo.company || "",
        name: workerInfo.name || "",
      }
      return {
        ...prev,
        workerSafetyItems: newWorkerSafetyItems,
        workContent: workerInfo.constructionCompany || "",
      }
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.scale(dpr, dpr)
        ctx.imageSmoothingEnabled = true
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
      }

      canvas.style.width = rect.width + "px"
      canvas.style.height = rect.height + "px"
    }
  }, [])

  const validateHealthCheck = () => {
    const allAnswered =
      preWorkHealthItems.every((item) => healthCheck[item]) && postWorkHealthItems.every((item) => healthCheck[item])
    if (!allAnswered) {
      alert("모든 건강체크 항목에 응답해주세요.")
      return false
    }

    // 혈압 입력 필드 검증 추가
    if (!bloodPressure.systolic || !bloodPressure.diastolic) {
      alert("혈압 수치(수축기/이완기)를 모두 입력해주세요.")
      return false
    }

    return true
  }

  const validateSecurityPledge = () => {
    if (!securityPledge.agreed) {
      alert("보안서약서에 동의해주세요.")
      return false
    }
    if (!securityPledge.affiliation || !securityPledge.constructionName) {
      alert("소속과 공사명을 입력해주세요.")
      return false
    }
    if (!securityPledge.privacyAgreed) {
      alert("개인정보 수집·이용·제공에 동의해주세요.")
      return false
    }
    return true
  }

  const validateInfoProvision = () => {
    if (!infoProvision.targetWork) {
      alert("대상업무를 입력해주세요.")
      return false
    }
    if (!infoProvision.privacyAgreed) {
      alert("개인정보 수집·이용·제공에 동의해주세요.")
      return false
    }
    return true
  }

  const validateSafetyPledge = () => {
    if (!safetyPledge.agreed) {
      alert("무재해서약서에 동의해주세요.")
      return false
    }
    if (!safetyPledge.privacyAgreed) {
      alert("개인정보 수집·이용·제공에 동의해주세요.")
      return false
    }
    return true
  }

  const validateWorkAgreement = () => {
    if (!workAgreement.workContent || !workAgreement.workPeriodStart || !workAgreement.workPeriodEnd) {
      alert("모든 필수 항목을 입력해주세요.")
      return false
    }
    if (!workAgreement.privacyAgreed) {
      alert("개인정보 수집·이용·제공에 동의해주세요.")
      return false
    }
    return true
  }

  const moveToNextTab = (nextTab: string) => {
    let canProceed = false

    switch (currentTab) {
      case "health":
        canProceed = validateHealthCheck()
        break
      case "security":
        canProceed = validateSecurityPledge()
        break
      case "info":
        canProceed = validateInfoProvision()
        break
      case "safety":
        canProceed = validateSafetyPledge()
        break
      case "work":
        canProceed = validateWorkAgreement()
        break
      default:
        canProceed = true
    }

    if (canProceed) {
      setCurrentTab(nextTab)
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.strokeStyle = "#000"
    ctx.lineWidth = 1.5
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    let x, y
    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let x, y
    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (e) e.preventDefault()
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      setSignature(canvas.toDataURL())
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignature("")
  }

  const handleFinalSubmit = () => {
    if (!validateWorkAgreement()) return

    if (!signature) {
      alert("서명을 완료해주세요.")
      return
    }

    const supervisorRecord: SupervisorRecord = {
      workerInfo,
      healthCheck,
      securityPledge,
      infoProvision,
      safetyPledge,
      workAgreement,
      bloodPressure,
      signature,
      timestamp: new Date().toISOString(),
      type: "supervisor",
    }

    const existingRecords = JSON.parse(localStorage.getItem("supervisorRecords") || "[]")
    existingRecords.push(supervisorRecord)
    localStorage.setItem("supervisorRecords", JSON.stringify(existingRecords))

    const basicRecord = {
      workerType: workerInfo.workerType || "현장소장",
      company: workerInfo.company || "",
      name: workerInfo.name || "",
      phone: workerInfo.phone || "",
      workType: Array.isArray(workerInfo.workType) ? workerInfo.workType.join(", ") : workerInfo.workType || "",
      signature,
      timestamp: new Date().toISOString(),
      role: "현장소장",
      healthCheck: healthCheck || {},
      bloodPressure,
    }

    const existingSignatureRecords = JSON.parse(localStorage.getItem("signatureRecords") || "[]")
    existingSignatureRecords.push(basicRecord)
    localStorage.setItem("signatureRecords", JSON.stringify(existingSignatureRecords))

    alert("현장소장 종합 안전관리 시스템이 완료되었습니다.")
    window.location.href = "/"
  }

  const handleBloodPressureChange = (field: "systolic" | "diastolic", value: string) => {
    const newBloodPressure = { ...bloodPressure, [field]: value }
    setBloodPressure(newBloodPressure)

    // 혈압 데이터가 모두 입력되었는지 확인하여 완료 상태 업데이트
    const allHealthAnswered =
      preWorkHealthItems.every((item) => healthCheck[item]) && postWorkHealthItems.every((item) => healthCheck[item])
    const bloodPressureComplete = newBloodPressure.systolic && newBloodPressure.diastolic

    setCompletedSteps((prev) => ({
      ...prev,
      health: allHealthAnswered && bloodPressureComplete,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 text-center shadow-xl relative">
        <div className="flex flex-col items-center mb-2">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-lg">
            <span className="text-green-600 font-bold text-xl">GS</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">GS칼텍스</h1>
          <p className="text-lg text-green-100 font-medium">창원물류센터</p>
        </div>
        <div className="absolute bottom-2 right-4 text-green-100 text-sm italic">I am your safety</div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-green-700 text-center mb-6">현장소장 종합 안전관리 시스템</h2>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="health">상세건강체크</TabsTrigger>
            <TabsTrigger value="security">보안서약서</TabsTrigger>
            <TabsTrigger value="info">정보제공확인서</TabsTrigger>
            <TabsTrigger value="safety">무재해서약서</TabsTrigger>
            <TabsTrigger value="work">작업동의서</TabsTrigger>
            <TabsTrigger value="final">최종제출</TabsTrigger>
          </TabsList>

          <TabsContent value="health">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="text-white text-center">상세건강 Check List</CardTitle>
                <p className="text-green-100 text-sm text-center">(신규 인력 및 집중관리 대상자)</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="font-bold text-gray-700">업체명:</Label>
                    <Input value={securityPledge.affiliation} readOnly className="mt-1 border-gray-300 bg-gray-100" />
                  </div>
                  <div>
                    <Label className="font-bold text-gray-700">공사명:</Label>
                    <Input
                      value={securityPledge.constructionName}
                      readOnly
                      className="mt-1 border-gray-300 bg-gray-100"
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
                              onValueChange={(value) => setHealthCheck((prev) => ({ ...prev, [item]: value }))}
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
                              onValueChange={(value) => setHealthCheck((prev) => ({ ...prev, [item]: value }))}
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
                    ※ '상세건강 Check List' 작성으로 인해 발생하는 개인정보 수집 이용 제공에 대한 개별 사항(보호조치
                    포함)은 별도 동의서를 통해 '개인정보 수집·이용·제공 동의서'에 '상세건강 Check List' 상의 민감정보
                    수집 및 이용에 제공에 대한 사전동의를 받아 처리하게 됩니다.
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-400 p-4 bg-gray-50 mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="health-privacy-agreement"
                      checked={healthCheck.privacyAgreed}
                      onCheckedChange={(checked) => setHealthCheck((prev) => ({ ...prev, privacyAgreed: !!checked }))}
                      className="border-green-500 data-[state=checked]:bg-green-600"
                    />
                    <Label htmlFor="health-privacy-agreement" className="cursor-pointer text-xs font-medium">
                      개인정보 수집·이용·제공에 동의합니다
                    </Label>
                  </div>
                </div>

                <Button
                  onClick={() => moveToNextTab("security")}
                  className="bg-green-600 hover:bg-green-700 w-full mt-6 shadow-lg"
                >
                  다음 단계로
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="text-white">보안서약서</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="affiliation">소속</Label>
                    <Input
                      id="affiliation"
                      value={securityPledge.affiliation}
                      onChange={(e) => setSecurityPledge({ ...securityPledge, affiliation: e.target.value })}
                      className="bg-gray-100"
                      placeholder="소속을 입력하세요"
                    />
                  </div>
                  <div>
                    <Label htmlFor="construction">공사명</Label>
                    <Input
                      id="construction"
                      value={securityPledge.constructionName}
                      onChange={(e) => setSecurityPledge({ ...securityPledge, constructionName: e.target.value })}
                      className="bg-gray-100"
                      placeholder="공사명을 입력하세요"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded mb-4 text-sm leading-relaxed">
                  <p className="text-blue-800 mb-2">
                    위 본인 및 당사는 GS칼텍스 창원물류센터의 상기 공사의 참여 및 관련업무를 수행함에 있어 상호 신뢰
                  </p>
                  <p className="text-blue-800 mb-2">
                    를 바탕으로 GS칼텍스의 정보 및 비밀 보호를 위해 아래 사항을 성실히 준수할 것을 서약합니다.
                  </p>

                  <div className="mt-4 space-y-2">
                    <p>
                      1. 사업수행 기간을 포함 종료후에도 GS칼텍스의 비밀정보(비밀, 대외비 및 이에 준하는 모든 사항) 및
                      정
                    </p>
                    <p className="ml-4">보를 어떤 사람에게도 직간접적으로 공개 또는 누설하지 않겠음.</p>

                    <p>
                      2. 사업을 이행하는 과정에서 얻은 GS칼텍스의 어떠한 비밀 또는 정보라도 사업수행 목적에만 사용하고
                    </p>
                    <p className="ml-4">그 외에는 유출, 누설, 손상하지 않겠음.</p>

                    <p>
                      3. 본 사업 수행과 관련하여 당사에서 채용한 근로자가 GS칼텍스의 보안규정에 관한 모든 사항을 철저
                    </p>
                    <p className="ml-4">
                      히 준수토록 관리하고, 비밀 유출 및 사진/동영상 촬영 등 일체의 보안사고가 발생하지 않도록 관리하
                    </p>
                    <p className="ml-4">겠음.</p>
                  </div>

                  <div className="mt-6 p-3 bg-white border-l-4 border-blue-500 text-xs">
                    <p>위와 같이 GS칼텍스 물류센터가 국가보안시설 및 위험물시설임을 항상 인지하고,</p>
                    <p>만일 서약 사항을 위반하였을 경우에는 법이 정한 바에 따라 민·형사상의 책임을 감수함을 물론, </p>
                    <p> GS칼텍스에 손해를 끼친 경우에는 해당 손해액을 지체 없이 변상할 것을 약속합니다.</p>
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
                      <RadioGroupItem value="yes" />
                      <Label className="cursor-pointer font-medium text-green-700">예</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" />
                      <Label className="cursor-pointer font-medium text-red-700">아니오</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="border-2 border-dashed border-gray-400 p-4 bg-gray-50 mb-4">
                  <div className="text-xs leading-relaxed space-y-2">
                    <p className="font-bold">
                      ※ '보안서약서' 작성으로 인해 발생하는 개인정보 수집·이용·제공에 대한 개별 사항(보호조치 포함)은
                      별도
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
                        onCheckedChange={(checked) =>
                          setSecurityPledge((prev) => ({ ...prev, privacyAgreed: !!checked }))
                        }
                      />
                      <Label htmlFor="security-privacy-agreement" className="cursor-pointer text-xs font-medium">
                        개인정보 수집·이용·제공에 동의합니다
                      </Label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => moveToNextTab("info")}
                  className="bg-green-600 hover:bg-green-700 w-full shadow-lg"
                >
                  다음 단계로
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="text-white text-center">정보제공확인서</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="info-company">1. 업체명 :</Label>
                    <Input id="info-company" value={infoProvision.companyName} readOnly className="bg-gray-100 mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="info-target">2. 대상업무 :</Label>
                    <Input id="info-target" value={infoProvision.targetWork} readOnly className="bg-gray-100 mt-1" />
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold mb-3">3. 정보 제공 사항</h3>
                  <div className="space-y-2">
                    {infoProvisionItems.map((item, index) => (
                      <p key={index} className="ml-4">
                        {index + 1}) {item}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded mb-4 text-center">
                  <p className="text-sm leading-relaxed">
                    당사의 업무 중{" "}
                    <span className="border-b border-gray-400 px-2 py-1 mx-2 bg-white">
                      {infoProvision.targetWork || "___________"}
                    </span>
                    와 관련하여 상기의 목록과 같이 작업
                  </p>
                  <p className="text-sm leading-relaxed mt-2">
                    중 화재·폭발, 독성물질 노출위험 등에 관한 정보를 제공받았으며, 안전수칙을 준
                  </p>
                  <p className="text-sm leading-relaxed">수하여 공사에 임하도록 하겠습니다.</p>
                </div>

                <div className="text-center mt-8 mb-6">
                  <p className="text-lg">
                    <span className="border-b border-gray-400 px-2 py-1 mx-1 bg-white">{new Date().getFullYear()}</span>
                    <span className="mx-2">년</span>
                    <span className="border-b border-gray-400 px-2 py-1 mx-1 bg-white">
                      {new Date().getMonth() + 1}
                    </span>
                    <span className="mx-2">월</span>
                    <span className="border-b border-gray-400 px-2 py-1 mx-1 bg-white">{new Date().getDate()}</span>
                    <span className="mx-2">일</span>
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-400 p-4 bg-gray-50 mb-4">
                  <div className="text-xs leading-relaxed space-y-2">
                    <p className="font-bold">
                      ※ '정보제공확인서' 작성으로 인해 발생하는 개인정보 수집·이용·제공에 대한 개별 사항(보호조치
                      포함)은 별도
                    </p>
                    <p className="ml-4">
                      고지를 통해 안내하며, 위 개인정보 수집·이용·제공에 대한 개인정보 수집 이용 제공에 대한
                    </p>
                    <p className="ml-4">사전동의는 별도 작성한 개인정보 수집 이용 제공 동의서에 의합니다.</p>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="info-privacy-agreement"
                        checked={infoProvision.privacyAgreed}
                        onCheckedChange={(checked) =>
                          setInfoProvision((prev) => ({ ...prev, privacyAgreed: !!checked }))
                        }
                      />
                      <Label htmlFor="info-privacy-agreement" className="cursor-pointer text-xs font-medium">
                        개인정보 수집·이용·제공에 동의합니다
                      </Label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => moveToNextTab("safety")}
                  className="bg-green-600 hover:bg-green-700 w-full shadow-lg"
                >
                  다음 단계로
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safety">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="text-white">무재해서약서</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gray-50 p-6 rounded mb-4 text-sm leading-relaxed">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <strong>계약명:</strong> {securityPledge.constructionName || "___"}
                      </div>
                      <div>
                        <strong>업체명:</strong> {workerInfo.company || "___"}
                      </div>
                    </div>
                    <div className="mb-4">
                      <strong>대표/현장소장:</strong> {workerInfo.name || "___"}
                    </div>
                  </div>

                  <p className="mb-4 text-justify">
                    는(은) GS칼텍스주식회사의 시설협력업체 대표로서 그 역할과 책임을 명확히 이해하고, 안전의 중요성을
                    깊이 인식하여 무재해 달성을 위해 다음의 내용을 성실히 이행할 것을 서약합니다.
                  </p>

                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                    <li>나는 귀사에서 수행하는 모든 공사에 대해 안전환경 절차와 수칙을 철저히 준수하겠습니다.</li>
                    <li>나는 귀사의 사회적 책임을 인식하고 안전 및 환경사고 예방활동에 적극 앞장서겠습니다.</li>
                    <li>나는 귀사 시설협력업체의 자긍심을 가지고 무재해 달성을 위해 최선을 다하겠습니다.</li>
                  </ul>

                  <p className="mb-4 text-justify">
                    또한 귀사와의 거래에 있어 공정하고 투명한 거래질서 준수와 윤리적 기업 문화의 정착을 위하여 다음의
                    내용을 성실히 이행할 것을 서약합니다.
                  </p>

                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                    <li>
                      나는 귀사와의 거래에 있어 부정한 목적을 위해 금품 또는 경제적 이익을 귀사의 임직원에게 제공하지
                      않겠습니다.
                    </li>
                    <li>
                      나는 귀사와의 거래에 있어 귀사의 임직원에게 통상적인 수준을 초과하는 일체의 향응, 접대 등을
                      제공하지 않겠으며 기타 거래행위에 부정이 개입되거나, 이를 유도하는 행위를 하지 않겠습니다.
                    </li>
                    <li>
                      나는 귀사와의 거래에 있어 귀사의 윤리규범을 위반하거나 공정거래질서를 저해하는 행위를 하지
                      않겠습니다.
                    </li>
                  </ul>

                  <p className="mb-4 text-justify">
                    위의 사항을 위반하여 각종 재해를 발생시켜 귀사에 손해를 입히는 경우 또는 부정한 거래행위가 드러날
                    경우 그 정도에 따라 거래중지 등 귀사에서 시행하는 어떠한 조치에도 따르겠습니다.
                  </p>

                  <div className="mt-6 p-3 bg-blue-50 border-l-4 border-blue-500 text-xs">
                    <p className="font-bold">
                      ※ 2부를 작성하여 1부는 업체가 소지하고, 1부는 GS칼텍스 물류센터에 제출하여 주시기 바랍니다.
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <RadioGroup
                    value={safetyPledge.agreed ? "yes" : "no"}
                    onValueChange={(value) => setSafetyPledge((prev) => ({ ...prev, agreed: value === "yes" }))}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" />
                      <Label className="cursor-pointer font-medium text-green-700">예</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" />
                      <Label className="cursor-pointer font-medium text-red-700">아니오</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="border-2 border-dashed border-gray-400 p-4 bg-gray-50 mb-4">
                  <div className="text-xs leading-relaxed space-y-2">
                    <p className="font-bold">
                      ※ '무재해서약서' 작성으로 인해 발생하는 개인정보 수집·이용·제공에 대한 개별 사항(보호조치 포함)은
                      별도
                    </p>
                    <p className="ml-4">
                      고지를 통해 안내하며, 위 개인정보 수집·이용·제공에 대한 개인정보 수집 이용 제공에 대한
                    </p>
                    <p className="ml-4">사전동의는 별도 작성한 개인정보 수집 이용 제공 동의서에 의합니다.</p>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="safety-privacy-agreement"
                        checked={safetyPledge.privacyAgreed}
                        onCheckedChange={(checked) =>
                          setSafetyPledge((prev) => ({ ...prev, privacyAgreed: !!checked }))
                        }
                      />
                      <Label htmlFor="safety-privacy-agreement" className="cursor-pointer text-xs font-medium">
                        개인정보 수집·이용·제공에 동의합니다
                      </Label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => moveToNextTab("work")}
                  className="bg-green-600 hover:bg-green-700 w-full shadow-lg"
                >
                  다음 단계로
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="work">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="text-white text-center">작업동의서</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto mb-6">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 p-2 bg-gray-100">1. 근로자 안전사항</th>
                        <th className="border border-gray-300 p-2 bg-gray-100">소속</th>
                        <th className="border border-gray-300 p-2 bg-gray-100">이름</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-2 text-center align-middle font-bold" rowSpan={6}>
                          근로자정보
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            value={workAgreement.workerSafetyItems[0]?.affiliation || ""}
                            onChange={(e) => {
                              const newItems = [...workAgreement.workerSafetyItems]
                              newItems[0] = { ...newItems[0], affiliation: e.target.value }
                              setWorkAgreement((prev) => ({ ...prev, workerSafetyItems: newItems }))
                            }}
                            className="border-0 bg-transparent"
                          />
                        </td>
                        <td className="border border-gray-300 p-2">
                          <Input
                            value={workAgreement.workerSafetyItems[0]?.name || ""}
                            onChange={(e) => {
                              const newItems = [...workAgreement.workerSafetyItems]
                              newItems[0] = { ...newItems[0], name: e.target.value }
                              setWorkAgreement((prev) => ({ ...prev, workerSafetyItems: newItems }))
                            }}
                            className="border-0 bg-transparent"
                          />
                        </td>
                      </tr>
                      {workAgreement.workerSafetyItems.slice(1).map((item, index) => (
                        <tr key={index + 1}>
                          <td className="border border-gray-300 p-2">
                            <Input
                              value={item.affiliation}
                              onChange={(e) => {
                                const newItems = [...workAgreement.workerSafetyItems]
                                newItems[index + 1] = { ...newItems[index + 1], affiliation: e.target.value }
                                setWorkAgreement((prev) => ({ ...prev, workerSafetyItems: newItems }))
                              }}
                              className="border-0 bg-transparent"
                            />
                          </td>
                          <td className="border border-gray-300 p-2">
                            <Input
                              value={item.name}
                              onChange={(e) => {
                                const newItems = [...workAgreement.workerSafetyItems]
                                newItems[index + 1] = { ...newItems[index + 1], name: e.target.value }
                                setWorkAgreement((prev) => ({ ...prev, workerSafetyItems: newItems }))
                              }}
                              className="border-0 bg-transparent"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="work-content" className="font-bold">
                      2. 공사내용
                    </Label>
                    <Textarea
                      id="work-content"
                      value={workAgreement.workContent}
                      onChange={(e) => setWorkAgreement((prev) => ({ ...prev, workContent: e.target.value }))}
                      className="mt-2 min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="font-bold">3. 공사기간</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <Label className="text-sm">시작일</Label>
                        <Input
                          type="date"
                          value={workAgreement.workPeriodStart}
                          onChange={(e) => setWorkAgreement((prev) => ({ ...prev, workPeriodStart: e.target.value }))}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">종료일</Label>
                        <Input
                          type="date"
                          value={workAgreement.workPeriodEnd}
                          onChange={(e) => setWorkAgreement((prev) => ({ ...prev, workPeriodEnd: e.target.value }))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm">위 작업을 수행하고 관리자의 작업지시에 따를 것을 동의합니다.</p>
                </div>

                <div className="border-2 border-dashed border-gray-400 p-4 bg-gray-50 mb-4">
                  <div className="text-xs leading-relaxed space-y-2">
                    <p className="font-bold">
                      ※ '작업동의서' 작성으로 인해 발생하는 개인정보 수집·이용·제공에 대한 개별 사항(보호조치 포함)은
                      별도
                    </p>
                    <p className="ml-4">
                      고지를 통해 안내하며, 위 개인정보 수집·이용·제공에 대한 개인정보 수집 이용 제공에 대한
                    </p>
                    <p className="ml-4">사전동의는 별도 작성한 개인정보 수집 이용 제공 동의서에 의합니다.</p>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="work-privacy-agreement"
                        checked={workAgreement.privacyAgreed}
                        onCheckedChange={(checked) =>
                          setWorkAgreement((prev) => ({ ...prev, privacyAgreed: !!checked }))
                        }
                      />
                      <Label htmlFor="work-privacy-agreement" className="cursor-pointer text-xs font-medium">
                        개인정보 수집·이용·제공에 동의합니다
                      </Label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => moveToNextTab("final")}
                  className="bg-green-600 hover:bg-green-700 w-full shadow-lg"
                >
                  다음 단계로
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="final">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="text-white text-center">최종 제출</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center space-y-4 mb-6">
                  <div className="text-6xl text-green-600 mb-4">✓</div>
                  <h3 className="text-2xl font-bold text-green-700">모든 항목이 완료되었습니다</h3>
                  <p className="text-gray-600">
                    상세건강체크, 보안서약서, 정보제공확인서, 무재해서약서, 작업동의서가 모두 작성되었습니다.
                  </p>
                  <p className="text-sm text-gray-500">최종 제출 버튼을 클릭하시면 모든 정보가 저장됩니다.</p>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-bold text-green-700 mb-4 text-center">현장소장 서명</h4>
                  <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                    <canvas
                      ref={canvasRef}
                      className="border border-gray-300 rounded w-full h-48 cursor-crosshair bg-white"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      style={{ touchAction: "none" }}
                    />
                    <div className="flex justify-between mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={clearSignature}
                        className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                      >
                        서명 지우기
                      </Button>
                      <p className="text-sm text-gray-500 self-center">위 영역에 서명해주세요</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleFinalSubmit}
                  className="bg-green-600 hover:bg-green-700 w-full shadow-lg text-lg py-3"
                  disabled={!signature}
                >
                  최종 제출하기
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
