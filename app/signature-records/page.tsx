"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SignatureRecord {
  company: string
  name: string
  phone: string
  workType: string
  signature: string
  timestamp: string
  healthCheck?: { [key: string]: string }
  role?: string
}

export default function SignatureRecords() {
  const [records, setRecords] = useState<SignatureRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRecords, setFilteredRecords] = useState<SignatureRecord[]>([])
  const [healthFilter, setHealthFilter] = useState<string>("all")

  useEffect(() => {
    // Load signature records from localStorage
    const savedRecords = localStorage.getItem("signatureRecords")
    if (savedRecords) {
      const parsedRecords = JSON.parse(savedRecords)
      setRecords(parsedRecords)
      setFilteredRecords(parsedRecords)
    }
  }, [])

  const applyFilters = () => {
    let filtered = records

    // 검색 필터 적용
    if (searchTerm !== "") {
      filtered = filtered.filter((record) => record.name.includes(searchTerm) || record.company.includes(searchTerm))
    }

    // 건강체크 필터 적용
    if (healthFilter !== "all") {
      filtered = filtered.filter((record) => {
        if (!record.healthCheck) return healthFilter === "no-check"

        const { no } = getHealthCheckIssues(record.healthCheck)
        const hasIssues = no.length > 0

        if (healthFilter === "normal") return !hasIssues
        if (healthFilter === "issues") return hasIssues

        return true
      })
    }

    setFilteredRecords(filtered)
  }

  const handleSearch = () => {
    applyFilters()
  }

  const handleFilterChange = (value: string) => {
    setHealthFilter(value)
    // 필터 변경 시 즉시 적용
    setTimeout(() => applyFilters(), 0)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const getHealthCheckIssues = (healthCheck?: { [key: string]: string }) => {
    if (!healthCheck) return { no: [] }

    const healthItems = [
      "체온이 37.5도 이하임",
      "기침, 인후통 등 호흡기 증상이 없습니까?",
      "최근 14일 이내 해외여행을 하지 않았습니까?",
      "최근 14일 이내 확진자와 접촉하지 않았습니까?",
      "현재 격리 대상자가 아닙니까?",
      "음주를 하지 않았습니까?",
      "충분한 수면을 취했습니까?",
      "현재 복용 중인 약물이 작업에 영향을 주지 않습니까?",
      "시력에 이상이 없습니까?",
      "청력에 이상이 없습니까?",
      "현재 몸의 컨디션이 양호합니까?",
      "작업 수행에 지장을 줄 만한 질병이 없습니까?",
      "안전장비 착용에 문제가 없습니까?",
      "작업 중 응급상황 발생 시 대처할 수 있습니까?",
    ]

    console.log("[v0] 건강체크 데이터:", healthCheck)
    console.log("[v0] 건강체크 키들:", Object.keys(healthCheck))

    const no = healthItems.filter((item) => healthCheck[item] === "no")

    console.log("[v0] 아니오 선택 항목들:", no)

    return { no }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-5 text-center shadow-lg">
        <div className="flex flex-col items-center mb-2">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-lg">
            <span className="text-green-600 font-bold text-xl">GS</span>
          </div>
          <div className="text-2xl font-bold mb-1">GS칼텍스</div>
          <p className="text-lg text-green-100 font-medium">창원물류센터</p>
        </div>
      </div>

      {/* Sub Header */}
      <div className="bg-white text-green-700 p-4 text-center text-lg font-semibold border-b-2 border-green-200 shadow-sm">
        안전교육 서명 내역
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-5">
        <div className="flex gap-3 mb-5">
          <Input
            type="text"
            placeholder="이름 또는 회사명으로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 text-base p-3 border-green-200 focus:border-green-500 focus:ring-green-500"
          />
          <Select value={healthFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-48 border-green-200 focus:border-green-500 focus:ring-green-500">
              <SelectValue placeholder="건강체크 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 보기</SelectItem>
              <SelectItem value="normal">건강체크 이상없음</SelectItem>
              <SelectItem value="issues">건강체크 이상있음</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700 px-6 shadow-lg">
            <Search className="w-4 h-4 mr-2" />
            검색
          </Button>
        </div>

        {healthFilter !== "all" && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-green-700 font-medium">
              필터: {healthFilter === "normal" ? "건강체크 이상없음" : "건강체크 이상있음"}({filteredRecords.length}명)
            </span>
          </div>
        )}

        {/* Records Container */}
        <div className="space-y-5">
          {filteredRecords.length === 0 ? (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-10 text-center text-gray-500">
                {healthFilter !== "all" ? "해당 조건에 맞는 기록이 없습니다." : "저장된 서명 기록이 없습니다."}
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((record, index) => (
              <Card
                key={index}
                className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="font-bold text-green-700 block mb-1">소속회사</label>
                      <div className="text-gray-800">{record.company}</div>
                    </div>
                    <div>
                      <label className="font-bold text-green-700 block mb-1">성명</label>
                      <div className="text-gray-800">{record.name}</div>
                    </div>
                    <div>
                      <label className="font-bold text-green-700 block mb-1">연락처</label>
                      <div className="text-gray-800">{record.phone}</div>
                    </div>
                    <div>
                      <label className="font-bold text-green-700 block mb-1">작업종류</label>
                      <div className="text-gray-800">{record.workType}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="font-bold text-green-700 block mb-2">서명</label>
                    <img
                      src={record.signature || "/placeholder.svg"}
                      alt="서명"
                      className="max-w-xs border-2 border-green-200 rounded-lg shadow-sm"
                    />
                  </div>

                  {record.healthCheck && (
                    <div className="mb-3">
                      <label className="font-bold text-green-700 block mb-2">상세건강체크 결과</label>
                      {(() => {
                        const { no } = getHealthCheckIssues(record.healthCheck)
                        const hasIssues = no.length > 0

                        return (
                          <div
                            className={`p-4 rounded-lg border-2 ${hasIssues ? "bg-red-50 border-red-300" : "bg-green-50 border-green-300"}`}
                          >
                            {hasIssues ? (
                              <div>
                                <div className="flex items-center mb-3">
                                  <span className="text-red-700 font-bold text-lg bg-red-100 px-3 py-1 rounded-full border border-red-300">
                                    ⚠️ 건강체크 문제 발견
                                  </span>
                                </div>
                                <div>
                                  <div className="text-red-800 font-bold mb-3 bg-red-200 px-4 py-2 rounded-lg border border-red-400">
                                    '아니오' 선택 항목 ({no.length}개):
                                  </div>
                                  <div className="space-y-2">
                                    {no.map((item, idx) => (
                                      <div key={idx} className="bg-red-100 border-l-4 border-red-500 p-3 rounded-r-lg">
                                        <span className="text-red-700 font-semibold text-sm">• {item}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <span className="text-green-600 font-bold">✅ 이상없음</span>
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                    교육일시: {new Date(record.timestamp).toLocaleString()}
                    {record.role && <span className="ml-4">역할: {record.role}</span>}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-green-600 hover:bg-green-700 px-8 shadow-lg"
          >
            메인으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  )
}
