"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { preWorkHealthItems, postWorkHealthItems } from "@/app/constants/healthItems"

interface SignatureRecord {
  company: string
  name: string
  phone: string
  workType: string | string[]
  signature: string
  timestamp: string
  healthCheck?: { [key: string]: string }
  role?: string
  bloodPressure?: string
  additionalNotes?: string
  securityPledge?: { [key: string]: string; agreed: boolean; constructionName: string; company: string }
  constructionCompany?: string
  informationConfirmation?: {
    companyName: string
    targetTask: string
    providedItems: string[]
    agreed: boolean
    date: string
  }
}

interface SupervisorRecord {
  workerInfo: {
    workerType: string
    company: string
    name: string
    phone: string
    workType: string
  }
  healthCheck: { [key: string]: string }
  securityPledge: {
    agreed: boolean
    affiliation: string
    constructionName: string
    privacyAgreed?: boolean
  }
  safetyPledge: {
    agreed: boolean
  }
  workAgreement: {
    workerSafetyItems?: Array<{ affiliation: string; name: string }>
    workContent: string
    workPeriodStart: string
    workPeriodEnd: string
    privacyAgreed?: boolean
  }
  signature: string
  timestamp: string
  type: string
  infoProvision?: {
    company: string
    targetWork: string
    date: string
    companyName?: string
    privacyAgreed?: boolean
  }
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [records, setRecords] = useState<SignatureRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<SignatureRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecord, setSelectedRecord] = useState<SignatureRecord | null>(null)
  const [selectedSupervisorRecord, setSelectedSupervisorRecord] = useState<SupervisorRecord | null>(null)
  const [supervisorModalTab, setSupervisorModalTab] = useState("health")
  const [selectedWorkerRecord, setSelectedWorkerRecord] = useState<SignatureRecord | null>(null)
  const [workerModalTab, setWorkerModalTab] = useState("health")
  const [filterType, setFilterType] = useState<"all" | "date" | "company">("all")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedCompany, setSelectedCompany] = useState("")

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "2040") {
      setIsAuthenticated(true)
      setPasswordError("")
    } else {
      setPasswordError("비밀번호가 올바르지 않습니다.")
      setPassword("")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword("")
    setPasswordError("")
    setSelectedRecord(null)
    setSelectedSupervisorRecord(null)
    setSearchTerm("")
    setFilterType("all")
    setSelectedDate("")
    setSelectedCompany("")
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  const applyFilters = useCallback(
    (recordsToFilter: SignatureRecord[]) => {
      let filtered = recordsToFilter

      if (searchTerm) {
        filtered = filtered.filter((record) => record.name.includes(searchTerm) || record.company.includes(searchTerm))
      }

      if (filterType === "date" && selectedDate) {
        filtered = filtered.filter((record) => {
          const recordDate = new Date(record.timestamp).toDateString()
          const filterDate = new Date(selectedDate).toDateString()
          return recordDate === filterDate
        })
      }

      if (filterType === "company" && selectedCompany) {
        filtered = filtered.filter((record) => record.company === selectedCompany)
      }

      setFilteredRecords(filtered)
    },
    [searchTerm, filterType, selectedDate, selectedCompany],
  )

  useEffect(() => {
    const savedRecords = JSON.parse(localStorage.getItem("signatureRecords") || "[]")
    setRecords(savedRecords)
    applyFilters(savedRecords)
  }, [applyFilters])

  const handleSearch = () => {
    applyFilters(records)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const uniqueDates = [...new Set(records.map((record) => new Date(record.timestamp).toDateString()))].sort()
  const uniqueCompanies = [...new Set(records.map((record) => record.company))].sort()

  const getGroupedRecords = () => {
    if (filterType === "date") {
      const grouped: { [key: string]: SignatureRecord[] } = {}
      filteredRecords.forEach((record) => {
        const date = new Date(record.timestamp).toLocaleDateString()
        if (!grouped[date]) grouped[date] = []
        grouped[date].push(record)
      })
      return grouped
    } else if (filterType === "company") {
      const grouped: { [key: string]: SignatureRecord[] } = {}
      filteredRecords.forEach((record) => {
        if (!grouped[record.company]) grouped[record.company] = []
        grouped[record.company].push(record)
      })
      return grouped
    }
    return { 전체: filteredRecords }
  }

  const getHealthCheckIssues = (healthCheck?: { [key: string]: string }) => {
    if (!healthCheck) return { no: [] }
    const allItems = [...preWorkHealthItems, ...postWorkHealthItems]
    const no = allItems.filter((item) => healthCheck[item] === "no" || healthCheck[item] === "이상")
    return { no }
  }

  const getSupervisorDetails = (record: SignatureRecord): SupervisorRecord | null => {
    const supervisorRecords = JSON.parse(localStorage.getItem("supervisorRecords") || "[]")
    console.log("[v0] Looking for supervisor record:", record.name, record.company)
    console.log("[v0] Available supervisor records:", supervisorRecords)

    const foundRecord =
      supervisorRecords.find(
        (sr: SupervisorRecord) =>
          sr.workerInfo.name === record.name &&
          sr.workerInfo.company === record.company &&
          Math.abs(new Date(sr.timestamp).getTime() - new Date(record.timestamp).getTime()) < 60000,
      ) || null

    if (foundRecord) {
      console.log("[v0] Found supervisor record with healthCheck:", foundRecord.healthCheck)
    }

    return foundRecord
  }

  const deleteRecord = (recordToDelete: SignatureRecord) => {
    if (window.confirm(`${recordToDelete.name}님의 기록을 삭제하시겠습니까?`)) {
      const existingRecords = JSON.parse(localStorage.getItem("signatureRecords") || "[]")
      const updatedRecords = existingRecords.filter(
        (record: SignatureRecord) =>
          !(
            record.name === recordToDelete.name &&
            record.company === recordToDelete.company &&
            record.timestamp === recordToDelete.timestamp
          ),
      )
      localStorage.setItem("signatureRecords", JSON.stringify(updatedRecords))

      if (recordToDelete.role === "현장소장") {
        const existingSupervisorRecords = JSON.parse(localStorage.getItem("supervisorRecords") || "[]")
        const updatedSupervisorRecords = existingSupervisorRecords.filter(
          (record: any) =>
            !(
              record.workerInfo?.name === recordToDelete.name &&
              record.workerInfo?.company === recordToDelete.company &&
              record.timestamp === recordToDelete.timestamp
            ),
        )
        localStorage.setItem("supervisorRecords", JSON.stringify(updatedSupervisorRecords))
      }

      setRecords(updatedRecords)
      applyFilters(updatedRecords)
      alert("기록이 삭제되었습니다.")
    }
  }

  const handlePrintAllSupervisorDocuments = (supervisorRecord: SupervisorRecord) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return
    const logoUrl = `${window.location.origin}/logo.png`
    const _sigRecords = JSON.parse(localStorage.getItem("signatureRecords") || "[]")
    const _matched = _sigRecords.find(
      (r) =>
        r.name === supervisorRecord.workerInfo.name &&
        r.company === supervisorRecord.workerInfo.company &&
        Math.abs(new Date(r.timestamp).getTime() - new Date(supervisorRecord.timestamp).getTime()) < 60000,
    )
    const _bp = _matched?.bloodPressure
    
    
    /*const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>현장소장 종합 서약서 - ${supervisorRecord.workerInfo.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px; }
            .section { margin-bottom: 40px; page-break-inside: avoid; }
            .section-page-break { margin-bottom: 40px; page-break-inside: avoid; page-break-before: always; }
            .section-title { background: #16a34a; color: white; padding: 10px; margin-bottom: 20px; font-size: 18px; font-weight: bold; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .info-item { padding: 10px; background: #f9f9f9; border-left: 4px solid #16a34a; }
            .health-item { display: flex; justify-content: space-between; padding: 8px; margin-bottom: 5px; background: #f9f9f9; border-radius: 4px; }
            .status-good { color: #16a34a; font-weight: bold; }
            .status-bad { color: #dc2626; font-weight: bold; }
            .status-none { color: #6b7280; }
            .agreement-text { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .agreement-status { padding: 10px; border-radius: 8px; font-weight: bold; text-align: center; }
            .agreement-yes { background: #dcfce7; color: #16a34a; }
            .agreement-no { background: #fee2e2; color: #dc2626; }
            .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .table th, .table td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            .table th { background: #f3f4f6; }
            @media print { body { margin: 0; } .section { page-break-inside: avoid; } .section-page-break { page-break-before: always; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>현장소장 종합 서약서</h1>
            <p><strong>성명:</strong> ${supervisorRecord.workerInfo.name} | <strong>소속:</strong> ${supervisorRecord.workerInfo.company}</p>
            <p><strong>작성일시:</strong> ${new Date(supervisorRecord.timestamp).toLocaleString()}</p>
            
          </div>

          <div class="section">
            <div class="section-title">상세건강체크</div>
            <h4>작업전 체크리스트</h4>
            ${preWorkHealthItems
              .map(
                (item, index) => `
              <div class="health-item">
                <span>${index + 1}. ${item}</span>
                <span class="${supervisorRecord.healthCheck?.[item] === "양호" ? "status-good" : supervisorRecord.healthCheck?.[item] === "이상" ? "status-bad" : "status-none"}">
                  ${supervisorRecord.healthCheck?.[item] === "양호" ? "양호" : supervisorRecord.healthCheck?.[item] === "이상" ? "이상" : "미응답"}
                </span>
              </div>
            `,
              )
              .join("")}
            
            <h4>작업후 체크리스트</h4>
            ${postWorkHealthItems
              .map(
                (item, index) => `
              <div class="health-item">
                <span>${preWorkHealthItems.length + index + 1}. ${item}</span>
                <span class="${supervisorRecord.healthCheck?.[item] === "양호" ? "status-good" : supervisorRecord.healthCheck?.[item] === "이상" ? "status-bad" : "status-none"}">
                  ${supervisorRecord.healthCheck?.[item] === "양호" ? "양호" : supervisorRecord.healthCheck?.[item] === "이상" ? "이상" : "미응답"}
                </span>
              </div>
            `,
              )
              .join("")}
            
              <div style="margin-top: 15px; padding: 10px; border: 1px dashed #6b7280; background: #f0fdf4;">
    <strong>혈압:</strong> ${_bp ? `${_bp.systolic}/${_bp.diastolic} mmHg` : "미입력"}
  </div>
            <div style="margin-top: 20px; padding: 10px; border: 1px dashed #6b7280; background: #f9f9f9;">
              <strong>개인정보 수집·이용·제공 동의:</strong> ${supervisorRecord.healthCheck?.privacyAgreed ? "동의함" : "미동의"}
            </div>*/
            const printContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>현장소장 종합 서약서 - ${supervisorRecord.workerInfo.name}</title>
      <style>
        body {
          font-family: 'Noto Sans KR', Arial, sans-serif;
          margin: 30px;
          line-height: 1.6;
          font-size: 14px;
          color: #111827;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #16a34a;
          padding-bottom: 15px;
        }

        .header h1 {
          margin-bottom: 10px;
          font-size: 24px;
          color: #16a34a;
        }

        .info-line {
          margin: 3px 0;
        }

        .section {
          margin-bottom: 50px;
        }

        .section-title {
          background: #16a34a;
          color: white;
          padding: 10px;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 20px;
          border-radius: 6px;
        }

        .health-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          margin-bottom: 6px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
        }

        .status-good {
          color: #16a34a;
          font-weight: bold;
        }

        .status-bad {
          color: #dc2626;
          font-weight: bold;
        }

        .status-none {
          color: #6b7280;
        }

        .highlight-box {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          padding: 12px;
          border-radius: 6px;
          margin-top: 15px;
        }

        .highlight-box strong {
          display: inline-block;
          margin-bottom: 5px;
          color: #065f46;
        }

        .agreement-status {
          padding: 12px;
          border-radius: 6px;
          font-weight: bold;
          text-align: center;
          margin-top: 10px;
        }

        .agreement-yes {
          background: #dcfce7;
          color: #16a34a;
        }

        .agreement-no {
          background: #fee2e2;
          color: #dc2626;
        }

        @media print {
          body { margin: 0; }
          .section { page-break-inside: avoid; }
          .section-page-break { page-break-before: always; }
        }
        .footer {
  position: fixed;
  bottom: 10px;
  left: 0;
  right: 0;
  font-size: 12px;
  color: #374151;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 20px;
  border-top: 1px solid #d1d5db;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-logo {
  height: 18px;
}

.footer-page:after {
  content: "Page " counter(page) " of " counter(pages);
}
      </style>
    </head>
    <body>
      <div class="header">
        <h1>현장소장 종합 서약서</h1>
        <p class="info-line"><strong>성명:</strong> ${supervisorRecord.workerInfo.name}</p>
        <p class="info-line"><strong>소속:</strong> ${supervisorRecord.workerInfo.company}</p>
        <p class="info-line"><strong>작성일시:</strong> ${new Date(supervisorRecord.timestamp).toLocaleString()}</p>
      </div>

      <div class="section">
        <div class="section-title">상세 건강 체크</div>

        <h4>작업 전 체크리스트</h4>
        ${preWorkHealthItems
          .map(
            (item, index) => `
          <div class="health-item">
            <span>${index + 1}. ${item}</span>
            <span class="${supervisorRecord.healthCheck?.[item] === "양호" ? "status-good" : supervisorRecord.healthCheck?.[item] === "이상" ? "status-bad" : "status-none"}">
              ${supervisorRecord.healthCheck?.[item] === "양호" ? "양호" : supervisorRecord.healthCheck?.[item] === "이상" ? "이상" : "미응답"}
            </span>
          </div>
        `).join("")}

        <h4 style="margin-top: 25px;">작업 후 체크리스트</h4>
        ${postWorkHealthItems
          .map(
            (item, index) => `
          <div class="health-item">
            <span>${preWorkHealthItems.length + index + 1}. ${item}</span>
            <span class="${supervisorRecord.healthCheck?.[item] === "양호" ? "status-good" : supervisorRecord.healthCheck?.[item] === "이상" ? "status-bad" : "status-none"}">
              ${supervisorRecord.healthCheck?.[item] === "양호" ? "양호" : supervisorRecord.healthCheck?.[item] === "이상" ? "이상" : "미응답"}
            </span>
          </div>
        `).join("")}

        <div class="highlight-box">
          <strong>혈압 수치</strong><br />
          ${_bp ? `${_bp.systolic} / ${_bp.diastolic} mmHg` : "미입력"}
        </div>

        <div class="highlight-box">
          <strong>개인정보 수집·이용·제공 동의</strong><br />
          ${supervisorRecord.healthCheck?.privacyAgreed ? "동의함" : "미동의"}
        </div>
          </div>

          <div class="section-page-break">
            <div class="section-title">보안서약서</div>
            <div class="info-grid">
              <div class="info-item"><strong>소속:</strong> ${supervisorRecord.securityPledge.affiliation}</div>
              <div class="info-item"><strong>공사명:</strong> ${supervisorRecord.securityPledge.constructionName}</div>
            </div>
            <div class="agreement-text">
              <p>위 본인 및 당사는 GS칼텍스 창원물류센터의 상기 공사의 참여 및 관련업무를 수행함에 있어 상황 신뢰를 바탕으로 GS칼텍스의 정보 및 비밀보호를 위해 아래 사항 업수 준수 서약합니다.</p>
              <ol>
                <li>사업수행 기간을 포함 종료후에도 GS칼텍스의 비밀정보 및 정보보호 어떤 사람에게도 직간접적으로 공개 또는 누설하지 않음.</li>
                <li>사업을 이행하는 과정에서 얻은 GS칼텍스의 어떠한 비밀 또는 정보라도 사업수행 목적에만 사용하고 그 외에는 유출, 누설하지 않음.</li>
                <li>본 사업 수행과 관련하여 당사에서 제공한 근로자가 GS칼텍스의 보안규정에 관한 모든 사항을 철저히 준수토록 관리하겠음.</li>
              </ol>
            </div>
            <div class="agreement-status ${supervisorRecord.securityPledge.agreed ? "agreement-yes" : "agreement-no"}">
              동의 여부: ${supervisorRecord.securityPledge.agreed ? "동의함" : "동의하지 않음"}
            </div>
          </div>

          <div class="section-page-break">
            <div class="section-title">정보제공확인서</div>
            <div class="info-item"><strong>업체명:</strong> ${supervisorRecord?.infoProvision?.companyName || ""}</div>
            <div class="info-item"><strong>대상업무:</strong> ${supervisorRecord?.infoProvision?.targetWork || ""}</div>
            <div class="info-item">
              <strong>제공 항목:</strong>
              <ul>
                <li>설비 유해위험 물질목록</li>
                <li>공정설명서 및 공정 도면</li>
                <li>위험성평가서</li>
                <li>안전운전 및 유지관리 지침서</li>
                <li>비상대응계획</li>
              </ul>
            </div>
            <div class="agreement-status ${supervisorRecord?.infoProvision?.privacyAgreed ? "agreement-yes" : "agreement-no"}">
              동의 여부: ${supervisorRecord?.infoProvision?.privacyAgreed ? "동의함" : "미동의"}
            </div>
            <div class="info-item"><strong>작성일자:</strong> ${supervisorRecord?.infoProvision?.date || new Date().toLocaleDateString("ko-KR")}</div>
          </div>

          <div class="section-page-break">
            <div class="section-title">무재해서약서</div>
            <div class="info-grid">
              <div class="info-item"><strong>계약명:</strong> ${supervisorRecord.securityPledge?.constructionName || "___"}</div>
              <div class="info-item"><strong>업체명:</strong> ${supervisorRecord.workerInfo?.company || "___"}</div>
              <div class="info-item"><strong>대표/현장소장:</strong> ${supervisorRecord.workerInfo?.name || "___"}</div>
            </div>
            <div class="agreement-text">
              <p>는(은) GS칼텍스주식회사의 시설협력업체 대표로서 그 역할과 책임을 명확히 이해하고, 안전의 중요성을 깊이 인식하여 무재해 달성을 위해 다음의 내용을 성실히 이행할 것을 서약합니다.</p>
              <ul>
                <li>나는 귀사에서 수행하는 모든 공사에 대해 안전환경 절차와 수칙을 철저히 준수하겠습니다.</li>
                <li>나는 귀사의 사회적 책임을 인식하고 안전 및 환경사고 예방활동에 적극 앞장서겠습니다.</li>
                <li>나는 귀사 시설협력업체의 자긍심을 가지고 무재해 달성을 위해 최선을 다하겠습니다.</li>
              </ul>
              <p>또한 귀사와의 거래에 있어 공정하고 투명한 거래질서 준수와 윤리적 기업 문화의 정착을 위하여 다음의 내용을 성실히 이행할 것을 서약합니다.</p>
              <ul>
                <li>나는 귀사와의 거래에 있어 부정한 목적을 위해 금품 또는 경제적 이익을 귀사의 임직원에게 제공하지 않겠습니다.</li>
                <li>나는 귀사와의 거래에 있어 귀사의 임직원에게 통상적인 수준을 초과하는 일체의 향응, 접대 등을 제공하지 않겠으며 기타 거래행위에 부정이 개입되거나, 이를 유도하는 행위를 하지 않겠습니다.</li>
                <li>나는 귀사와의 거래에 있어 귀사의 윤리규범을 위반하거나 공정거래질서를 저해하는 행위를 하지 않겠습니다.</li>
              </ul>
              <p>위의 사항을 위반하여 각종 재해를 발생시켜 귀사에 손해를 입히는 경우 또는 부정한 거래행위가 드러날 경우 그 정도에 따라 거래중지 등 귀사에서 시행하는 어떠한 조치에도 따르겠습니다.</p>
              <div class="notice">※ 2부를 작성하여 1부는 업체가 소지하고, 1부는 GS칼텍스 물류센터에 제출하여 주시기 바랍니다.</div>
            </div>
            <div class="agreement-status">동의 여부: ${supervisorRecord.safetyPledge?.agreed ? "동의함" : "미동의"}</div>
            <div class="privacy-agreement">개인정보 수집·이용·제공 동의: ${supervisorRecord.safetyPledge?.privacyAgreed ? "동의함" : "미동의"}</div>
          </div>

          <div class="section-page-break">
            <div class="section-title">작업동의서</div>
            <h4>근로자 안전사항</h4>
            <table class="table">
              <thead>
                <tr>
                  <th>소속</th>
                  <th>이름</th>
                </tr>
              </thead>
              <tbody>
                ${
                  supervisorRecord.workAgreement?.workerSafetyItems
                    ?.map(
                      (item) => `
                  <tr>
                    <td>${item.affiliation}</td>
                    <td>${item.name}</td>
                  </tr>
                `,
                    )
                    .join("") || '<tr><td colspan="2">정보 없음</td></tr>'
                }
              </tbody>
            </table>
            <div class="info-item"><strong>공사내용:</strong> ${supervisorRecord.workAgreement?.workContent || ""}</div>
            <div class="info-item">
              <strong>공사기간:</strong> ${supervisorRecord.workAgreement?.workPeriodStart || ""} ~ ${supervisorRecord.workAgreement?.workPeriodEnd || ""}
            </div>
            ${
              supervisorRecord.workAgreement?.privacyAgreed
                ? `
              <div class="agreement-status agreement-yes">
                개인정보 수집·이용·제공 동의: 동의함
              </div>
            `
                : ""
            }
          </div>

          <div class="section-page-break">
            <div class="section-title">서명</div>
            <div style="text-align: center; margin: 40px 0;">
              <div style="margin-bottom: 30px;">
                <strong style="font-size: 18px;">작성자 정보</strong>
              </div>
              <div style="margin-bottom: 20px;">
                <strong>성명:</strong> ${supervisorRecord.workerInfo.name}
              </div>
              <div style="margin-bottom: 20px;">
                <strong>소속:</strong> ${supervisorRecord.workerInfo.company}
              </div>
              <div style="margin-bottom: 20px;">
                <strong>역할:</strong> 현장소장
              </div>
              <div style="border: 2px solid #d1d5db; padding: 20px; margin: 20px auto; width: 300px; height: 150px; display: flex; align-items: center; justify-content: center; background: #f9f9f9;">
                ${supervisorRecord.signature ? `<img src="${supervisorRecord.signature}" alt="서명" style="max-width: 280px; max-height: 130px;">` : '<span style="color: #6b7280;">서명 없음</span>'}
              </div>
              <div style="margin-top: 20px;">
                <strong>서명일시:</strong> ${new Date(supervisorRecord.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
<div class="footer">
  <div class="footer-left">
    <img src="${logoUrl}" alt="회사 로고" class="footer-logo" />
    <span>GS 칼텍스 창원물류센터</span>
  </div>
  <div class="footer-right">
    <span class="footer-page"></span>
  </div>
</div>
</body>
</html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const handlePrintAllWorkerDocuments = (workerRecord: SignatureRecord) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>현장작업자 종합 서약서 - ${workerRecord.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px; }
            .section { margin-bottom: 40px; page-break-inside: avoid; }
            .section-page-break { margin-bottom: 40px; page-break-inside: avoid; page-break-before: always; }
            .section-title { background: #16a34a; color: white; padding: 10px; margin-bottom: 20px; font-size: 18px; font-weight: bold; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .info-item { padding: 10px; background: #f9f9f9; border-left: 4px solid #16a34a; }
            .health-item { display: flex; justify-content: space-between; padding: 8px; margin-bottom: 5px; background: #f9f9f9; border-radius: 4px; }
            .status-good { color: #16a34a; font-weight: bold; }
            .status-bad { color: #dc2626; font-weight: bold; }
            .status-none { color: #6b7280; }
            .agreement-text { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .agreement-status { padding: 10px; border-radius: 8px; font-weight: bold; text-align: center; }
            .agreement-yes { background: #dcfce7; color: #16a34a; }
            .agreement-no { background: #fee2e2; color: #dc2626; }
            .signature-box { border: 2px solid #16a34a; border-radius: 8px; padding: 20px; text-align: center; background: #f0fdf4; }
            @media print { body { margin: 0; } .section { page-break-inside: avoid; } .section-page-break { page-break-before: always; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>현장작업자 종합 서약서</h1>
            <p><strong>성명:</strong> ${workerRecord.name} | <strong>소속:</strong> ${workerRecord.company}</p>
            <p><strong>작성일시:</strong> ${new Date(workerRecord.timestamp).toLocaleString()}</p>
          </div>

          <div class="section">
            <div class="section-title">상세건강체크</div>
            <h4>작업전 체크리스트</h4>
            ${preWorkHealthItems
              .map(
                (item, index) => `
              <div class="health-item">
                <span>${index + 1}. ${item}</span>
                <span class="${workerRecord.healthCheck?.[item] === "양호" || workerRecord.healthCheck?.[item] === "yes" ? "status-good" : workerRecord.healthCheck?.[item] === "이상" || workerRecord.healthCheck?.[item] === "no" ? "status-bad" : "status-none"}">
                  ${workerRecord.healthCheck?.[item] === "양호" || workerRecord.healthCheck?.[item] === "yes" ? "양호" : workerRecord.healthCheck?.[item] === "이상" || workerRecord.healthCheck?.[item] === "no" ? "이상" : "미응답"}
                </span>
              </div>
            `,
              )
              .join("")}
            
            <h4>작업후 체크리스트</h4>
            ${postWorkHealthItems
              .map(
                (item, index) => `
              <div class="health-item">
                <span>${preWorkHealthItems.length + index + 1}. ${item}</span>
                <span class="${workerRecord.healthCheck?.[item] === "양호" || workerRecord.healthCheck?.[item] === "yes" ? "status-good" : workerRecord.healthCheck?.[item] === "이상" || workerRecord.healthCheck?.[item] === "no" ? "status-bad" : "status-none"}">
                  ${workerRecord.healthCheck?.[item] === "양호" || workerRecord.healthCheck?.[item] === "yes" ? "양호" : workerRecord.healthCheck?.[item] === "이상" || workerRecord.healthCheck?.[item] === "no" ? "이상" : "미응답"}
                </span>
              </div>
            `,
              )
              .join("")}
            ${
              workerRecord.bloodPressure &&
              (workerRecord.bloodPressure.systolic || workerRecord.bloodPressure.diastolic)
                ? `<div class="info-item" style="margin-top: 10px;">
          <strong>혈압 수치:</strong>
          <span>수축기 ${workerRecord.bloodPressure.systolic || "미입력"} / 이완기 ${workerRecord.bloodPressure.diastolic || "미입력"}</span>
       </div>`
                : ""
            }
            <div style="margin-top: 20px; padding: 10px; border: 1px dashed #6b7280; background: #f9f9f9;">
              <strong>개인정보 수집·이용·제공 동의:</strong> ${workerRecord.securityPledge?.privacyAgreed ? "동의함" : "미동의"}
            </div>
          </div>

          <div class="section-page-break">
            <div class="section-title">보안서약서</div>
            <div class="info-grid">
              <div class="info-item"><strong>소속:</strong> ${workerRecord.securityPledge?.affiliation || workerRecord.company}</div>
              <div class="info-item"><strong>공사명:</strong> ${workerRecord.securityPledge?.constructionName || ""}</div>
            </div>
            <div class="agreement-text">
              <p>위 본인 및 당사는 GS칼텍스 창원물류센터의 상기 공사의 참여 및 관련업무를 수행함에 있어 상기 신뢰를 바탕으로 GS칼텍스의 정보 및 비밀보호를 위해 아래 사항 엄수 준수할 것을 서약합니다.</p>
              <ol>
                <li>GS칼텍스의 영업비밀, 기술정보, 고객정보 등 일체의 정보를 외부에 누설하지 않겠습니다.</li>
                <li>업무상 취득한 정보를 개인적 목적으로 이용하지 않겠습니다.</li>
                <li>보안규정을 준수하고 관련 교육에 성실히 참여하겠습니다.</li>
                <li>계약 종료 후에도 비밀유지 의무를 지속하겠습니다.</li>
              </ol>
            </div>
            <div class="agreement-status ${workerRecord.securityPledge?.agreed ? "agreement-yes" : "agreement-no"}">
              동의 여부: ${workerRecord.securityPledge?.agreed ? "동의함" : "동의하지 않음"}
            </div>
          </div>

          <div class="section-page-break">
            <div class="section-title">디지털 서명</div>
            <div class="signature-box">
              ${workerRecord.signature ? `<img src="${workerRecord.signature}" alt="서명" style="max-width: 300px; max-height: 150px;">` : '<span style="color: #6b7280;">서명 없음</span>'}
              <p style="margin-top: 15px;"><strong>서명일시:</strong> ${new Date(workerRecord.timestamp).toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const groupedRecords = getGroupedRecords()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-xl">GS</span>
            </div>
            <h1 className="text-2xl font-bold text-green-700 mb-1">GS칼텍스</h1>
            <p className="text-green-600 font-medium">창원물류센터 관리자</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                관리자 비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="비밀번호를 입력하세요"
                autoFocus
              />
              {passwordError && <p className="mt-2 text-sm text-red-600">{passwordError}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 text-center shadow-xl relative">
        <div className="flex flex-col items-center mb-2">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-lg">
            <span className="text-green-600 font-bold text-xl">GS</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">관리자 대시보드</h1>
          <p className="text-lg text-green-100 font-medium">GS칼텍스 창원물류센터</p>
        </div>
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium transition-colors"
        >
          로그아웃
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-green-700 mb-4">서명 기록 관리</h2>

          <div className="flex gap-3 mb-4">
            <Input
              type="text"
              placeholder="이름 또는 회사명으로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
              검색
            </Button>
          </div>

          <div className="flex gap-2 mb-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as "all" | "date" | "company")}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">전체 보기</option>
              <option value="date">날짜별</option>
              <option value="company">업체별</option>
            </select>

            {filterType === "date" && (
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">날짜 선택</option>
                {uniqueDates.map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            )}

            {filterType === "company" && (
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">업체 선택</option>
                {uniqueCompanies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">이름</th>
                  <th className="px-4 py-3 text-left">회사</th>
                  <th className="px-4 py-3 text-left">연락처</th>
                  <th className="px-4 py-3 text-left">작업종류</th>
                  <th className="px-4 py-3 text-left">역할</th>
                  <th className="px-4 py-3 text-left">시간</th>
                  <th className="px-4 py-3 text-left">건강상태</th>
                  <th className="px-4 py-3 text-left">작업</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedRecords).map(([groupName, groupRecords]) =>
                  groupRecords.map((record, index) => {
                    const { no } = getHealthCheckIssues(record.healthCheck)
                    const hasHealthIssues = no.length > 0
                    const supervisorRecord = record.role === "현장소장" ? getSupervisorDetails(record) : null

                    return (
                      <tr key={`${groupName}-${index}`} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{record.name}</td>
                        <td className="px-4 py-3">{record.company}</td>
                        <td className="px-4 py-3">{record.phone}</td>
                        <td className="px-4 py-3">
                          {Array.isArray(record.workType) ? record.workType.join(", ") : record.workType}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              record.role === "현장소장" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {record.role || "현장작업자"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{new Date(record.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              hasHealthIssues ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            {hasHealthIssues ? "이상" : "정상"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            <button
                              onClick={() => setSelectedRecord(record)}
                              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                            >
                              상세보기
                            </button>
                            {record.role === "현장소장" && supervisorRecord && (
                              <button
                                onClick={() => setSelectedSupervisorRecord(supervisorRecord)}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                종합 서약서 보기
                              </button>
                            )}
                            {record.role !== "현장소장" && (
                              <button
                                onClick={() => setSelectedWorkerRecord(record)}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                종합 서약서 보기
                              </button>
                            )}
                            <button
                              onClick={() => deleteRecord(record)}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                              저장
                            </button>
                            <button className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700">
                              인쇄
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  }),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 상세보기 모달 */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-green-600 text-white p-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">작업자 상세 내역</h2>
                <button onClick={() => setSelectedRecord(null)} className="text-white hover:text-gray-200 text-2xl">
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <strong>소속회사:</strong> {selectedRecord.company}
                </div>
                <div>
                  <strong>작업종류:</strong>{" "}
                  {Array.isArray(selectedRecord.workType)
                    ? selectedRecord.workType.join(", ")
                    : selectedRecord.workType}
                </div>
                <div>
                  <strong>성명:</strong> {selectedRecord.name}
                </div>
                <div>
                  <strong>역할:</strong> {selectedRecord.role || "현장작업자"}
                </div>
                <div>
                  <strong>연락처:</strong> {selectedRecord.phone}
                </div>
                <div>
                  <strong>교육일시:</strong> {new Date(selectedRecord.timestamp).toLocaleString()}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-2">디지털 서명</h3>
                <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50 text-center">
                  {selectedRecord.signature ? (
                    <img
                      src={selectedRecord.signature || "/placeholder.svg"}
                      alt="서명"
                      className="max-w-full h-20 mx-auto"
                    />
                  ) : (
                    <span className="text-gray-500">서명 없음</span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-2">상세건강체크 결과</h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
                    <span className="text-green-800 font-medium">이상없음</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 현장소장 종합 서약서 모달 */}
      {selectedSupervisorRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">현장소장 종합 서약서</h2>
                <button
                  onClick={() => setSelectedSupervisorRecord(null)}
                  className="text-white hover:text-green-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex border-b border-gray-200 mb-6">
                {[
                  { id: "health", label: "상세건강체크" },
                  { id: "security", label: "보안서약서" },
                  { id: "infoProvision", label: "정보제공확인서" },
                  { id: "safety", label: "무재해서약서" },
                  { id: "work", label: "작업동의서" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSupervisorModalTab(tab.id)}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                      supervisorModalTab === tab.id
                        ? "border-green-600 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {supervisorModalTab === "health" && (
                <div>
                  <h3 className="text-lg font-bold text-green-700 mb-4">상세건강체크</h3>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-600">작업전 체크리스트</h4>
                    {preWorkHealthItems.map((item, index) => {
                      const healthValue = selectedSupervisorRecord.healthCheck?.[item]

                      return (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-sm">
                            {index + 1}. {item}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              healthValue === "양호"
                                ? "bg-green-100 text-green-800"
                                : healthValue === "이상"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {healthValue === "양호" ? "양호" : healthValue === "이상" ? "이상" : "미응답"}
                          </span>
                        </div>
                      )
                    })}

                    <h4 className="font-semibold text-green-600 mt-6">작업후 체크리스트</h4>
                    {postWorkHealthItems.map((item, index) => {
                      const healthValue = selectedSupervisorRecord.healthCheck?.[item]

                      return (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="text-sm">
                            {preWorkHealthItems.length + index + 1}. {item}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              healthValue === "양호"
                                ? "bg-green-100 text-green-800"
                                : healthValue === "이상"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {healthValue === "양호" ? "양호" : healthValue === "이상" ? "이상" : "미응답"}
                          </span>
                        </div>
                      )
                    })}

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-gray-700 mb-3">
                        ※ 상세건강체크 작성으로 인해 발생하는 개인정보 수집·이용·제공에 대한 개별 사항(보호조치 포함)은
                        별도 고지를 통해 안내하며, 위 개인정보 수집 이용 제공에 대한 개인정보 수집 이용 제공에 대한
                        사전동의는 별도 작성된 개인정보 수집 이용 제공 동의서에 의합니다.
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSupervisorRecord.healthCheck?.privacyAgreed || false}
                          readOnly
                          className="mr-2"
                        />
                        <span className="text-sm">개인정보 수집·이용·제공에 동의합니다</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {supervisorModalTab === "security" && (
                <div>
                  <h3 className="text-lg font-bold text-green-700 mb-4">보안서약서</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>소속:</strong> {selectedSupervisorRecord.securityPledge.affiliation}
                      </div>
                      <div>
                        <strong>공사명:</strong> {selectedSupervisorRecord.securityPledge.constructionName}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="mb-3">
                        위 본인 및 당사는 GS칼텍스 창원물류센터의 상기 공사의 참여 및 관련업무를 수행함에 있어 상황
                        신뢰를 바탕으로 GS칼텍스의 정보 및 비밀보호를 위해 아래 사항 업수 준수 서약합니다.
                      </p>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>1.</strong> GS칼텍스의 영업비밀, 기술정보, 고객정보 등 일체의 정보를 외부에 누설하지
                          않겠습니다.
                        </p>
                        <p>
                          <strong>2.</strong> 업무상 취득한 정보를 개인적 목적으로 이용하지 않겠습니다.
                        </p>
                        <p>
                          <strong>3.</strong> 본 사업 수행과 관련하여 당사에서 제공한 근로자가 GS칼텍스의 보안규정에
                          관한 모든 사항을 철저히 준수토록 관리하겠음.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${selectedSupervisorRecord.securityPledge.agreed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                    >
                      <strong>
                        동의 여부: {selectedSupervisorRecord.securityPledge.agreed ? "동의함" : "동의하지 않음"}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {supervisorModalTab === "infoProvision" && (
                <div>
                  <h3 className="text-lg font-bold text-green-700 mb-4">정보제공확인서</h3>
                  <div className="space-y-2">
                    <p>
                      <strong>업체명:</strong> {selectedSupervisorRecord?.infoProvision?.companyName || ""}
                    </p>
                    <p>
                      <strong>대상업무:</strong> {selectedSupervisorRecord?.infoProvision?.targetWork || ""}
                    </p>
                    <div>
                      <strong>제공 항목:</strong>
                      <ul className="list-disc list-inside">
                        {[
                          "설비 유해위험 물질목록",
                          "공정설명서 및 공정 도면",
                          "위험성평가서",
                          "안전운전 및 유지관리 지침서",
                          "비상대응계획",
                        ].map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <p>
                      <strong>동의 여부:</strong>{" "}
                      {selectedSupervisorRecord?.infoProvision?.privacyAgreed ? "동의함" : "미동의"}
                    </p>
                    <p>
                      <strong>작성일자:</strong>{" "}
                      {selectedSupervisorRecord?.infoProvision?.date || new Date().toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </div>
              )}

              {supervisorModalTab === "safety" && (
                <div>
                  <h3 className="text-lg font-bold text-green-700 mb-4">무재해서약서</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <strong>계약명:</strong>{" "}
                            {selectedSupervisorRecord.securityPledge?.constructionName || "___"}
                          </div>
                          <div>
                            <strong>업체명:</strong> {selectedSupervisorRecord.workerInfo?.company || "___"}
                          </div>
                        </div>
                        <div className="mb-4">
                          <strong>대표/현장소장:</strong> {selectedSupervisorRecord.workerInfo?.name || "___"}
                        </div>
                      </div>

                      <p className="mb-3 text-sm text-justify">
                        는(은) GS칼텍스주식회사의 시설협력업체 대표로서 그 역할과 책임을 명확히 이해하고, 안전의
                        중요성을 깊이 인식하여 무재해 달성을 위해 다음의 내용을 성실히 이행할 것을 서약합니다.
                      </p>

                      <ul className="list-disc list-inside space-y-1 text-sm mb-3">
                        <li>나는 귀사에서 수행하는 모든 공사에 대해 안전환경 절차와 수칙을 철저히 준수하겠습니다.</li>
                        <li>나는 귀사의 사회적 책임을 인식하고 안전 및 환경사고 예방활동에 적극 앞장서겠습니다.</li>
                        <li>나는 귀사 시설협력업체의 자긍심을 가지고 무재해 달성을 위해 최선을 다하겠습니다.</li>
                      </ul>

                      <p className="mb-3 text-sm text-justify">
                        또한 귀사와의 거래에 있어 공정하고 투명한 거래질서 준수와 윤리적 기업 문화의 정착을 위하여
                        다음의 내용을 성실히 이행할 것을 서약합니다.
                      </p>

                      <ul className="list-disc list-inside space-y-1 text-sm mb-3">
                        <li>
                          나는 귀사와의 거래에 있어 부정한 목적을 위해 금품 또는 경제적 이익을 귀사의 임직원에게
                          제공하지 않겠습니다.
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

                      <p className="mb-3 text-sm text-justify">
                        위의 사항을 위반하여 각종 재해를 발생시켜 귀사에 손해를 입히는 경우 또는 부정한 거래행위가
                        드러날 경우 그 정도에 따라 거래중지 등 귀사에서 시행하는 어떠한 조치에도 따르겠습니다.
                      </p>

                      <div className="mt-4 p-2 bg-blue-50 border-l-4 border-blue-500 text-xs">
                        <p className="font-bold">
                          ※ 2부를 작성하여 1부는 업체가 소지하고, 1부는 GS칼텍스 물류센터에 제출하여 주시기 바랍니다.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${selectedSupervisorRecord.safetyPledge.agreed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                    >
                      <strong>
                        서약 동의: {selectedSupervisorRecord.safetyPledge.agreed ? "동의함" : "동의하지 않음"}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {supervisorModalTab === "work" && (
                <div>
                  <h3 className="text-lg font-bold text-green-700 mb-4">작업동의서</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-bold mb-3">근로자 안전사항</h4>
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr>
                            <th className="border border-gray-300 p-2 bg-gray-100">소속</th>
                            <th className="border border-gray-300 p-2 bg-gray-100">이름</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSupervisorRecord.workAgreement?.workerSafetyItems?.map((item, index) => (
                            <tr key={index}>
                              <td className="border border-gray-300 p-2">{item.affiliation}</td>
                              <td className="border border-gray-300 p-2">{item.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div>
                      <strong>공사내용:</strong>
                      <div className="bg-gray-50 p-3 rounded mt-2">
                        {selectedSupervisorRecord.workAgreement?.workContent || ""}
                      </div>
                    </div>
                    <div>
                      <strong>공사기간:</strong>
                      <div className="bg-gray-50 p-3 rounded mt-2">
                        {selectedSupervisorRecord.workAgreement?.workPeriodStart || ""} ~{" "}
                        {selectedSupervisorRecord.workAgreement?.workPeriodEnd || ""}
                      </div>
                    </div>
                    {selectedSupervisorRecord.workAgreement?.privacyAgreed && (
                      <div className="bg-green-50 p-3 rounded-lg text-green-700">
                        <strong>개인정보 수집·이용·제공 동의: 동의함</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handlePrintAllSupervisorDocuments(selectedSupervisorRecord)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  전체 인쇄
                </button>
                <button
                  onClick={() => setSelectedSupervisorRecord(null)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 현장작업자 종합 서약서 모달 */}
      {selectedWorkerRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">현장작업자 종합 서약서</h2>
                <button
                  onClick={() => setSelectedWorkerRecord(null)}
                  className="text-white hover:text-green-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex border-b border-gray-200 mb-6">
                {[
                  { id: "health", label: "상세건강체크" },
                  { id: "security", label: "보안서약서" },
                  { id: "signature", label: "서명" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setWorkerModalTab(tab.id)}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                      workerModalTab === tab.id
                        ? "border-green-600 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {workerModalTab === "health" && (
                <div>
                  <h3 className="text-lg font-bold text-green-700 mb-4">상세건강체크</h3>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-600">작업전 체크리스트</h4>
                    {preWorkHealthItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-sm">
                          {index + 1}. {item}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            selectedWorkerRecord.healthCheck?.[item] === "양호"
                              ? "bg-green-100 text-green-800"
                              : selectedWorkerRecord.healthCheck?.[item] === "이상"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selectedWorkerRecord.healthCheck?.[item] === "양호"
                            ? "양호"
                            : selectedWorkerRecord.healthCheck?.[item] === "이상"
                              ? "이상"
                              : "미응답"}
                        </span>
                      </div>
                    ))}

                    <h4 className="font-semibold text-green-600 mt-6">작업후 체크리스트</h4>
                    {postWorkHealthItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-sm">
                          {preWorkHealthItems.length + index + 1}. {item}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            selectedWorkerRecord.healthCheck?.[item] === "양호"
                              ? "bg-green-100 text-green-800"
                              : selectedWorkerRecord.healthCheck?.[item] === "이상"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selectedWorkerRecord.healthCheck?.[item] === "양호"
                            ? "양호"
                            : selectedWorkerRecord.healthCheck?.[item] === "이상"
                              ? "이상"
                              : "미응답"}
                        </span>
                      </div>
                    ))}

                    {selectedWorkerRecord.bloodPressure &&
                      (selectedWorkerRecord.bloodPressure.systolic || selectedWorkerRecord.bloodPressure.diastolic) && (
                        <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                          <h5 className="font-semibold text-blue-700 mb-2">혈압 수치</h5>
                          <div className="text-sm text-blue-600">
                            수축기: {selectedWorkerRecord.bloodPressure.systolic || "미입력"} / 이완기:{" "}
                            {selectedWorkerRecord.bloodPressure.diastolic || "미입력"}
                          </div>
                        </div>
                      )}

                    {selectedWorkerRecord.additionalNotes && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                        <h5 className="font-semibold text-yellow-700 mb-2">기타사항</h5>
                        <div className="text-sm text-yellow-600">{selectedWorkerRecord.additionalNotes}</div>
                      </div>
                    )}

                    <div className="border-2 border-dashed border-gray-400 p-4 bg-gray-50 mt-4">
                      <div className="text-xs leading-relaxed space-y-2 mb-3">
                        <p>
                          ※ '상세건강 Check List' 작성으로 인해 발생하는 개인정보 수집 이용 제공에 대한 개별
                          사항(보호조치 포함)은 별도 동의서를 통해 '개인정보 수집·이용·제공 동의서'에 '상세건강 Check
                          List' 상의 민감정보 수집 및 이용에 제공에 대한 사전동의를 받아 처리하게 됩니다.
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-4 h-4 rounded border ${
                            selectedWorkerRecord.securityPledge?.privacyAgreed
                              ? "bg-green-600 border-green-600"
                              : "border-gray-400"
                          }`}
                        >
                          {selectedWorkerRecord.securityPledge?.privacyAgreed && (
                            <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs font-medium">
                          개인정보 수집·이용·제공에 동의합니다 (
                          {selectedWorkerRecord.securityPledge?.privacyAgreed ? "동의함" : "미동의"})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {workerModalTab === "security" && (
                <div>
                  <h3 className="text-lg font-bold text-green-700 mb-4">보안서약서</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>소속:</strong>{" "}
                        {selectedWorkerRecord.securityPledge?.affiliation || selectedWorkerRecord.company}
                      </div>
                      <div>
                        <strong>공사명:</strong> {selectedWorkerRecord.securityPledge?.constructionName || ""}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="mb-3">
                        위 본인 및 당사는 GS칼텍스 창원물류센터의 상기 공사의 참여 및 관련업무를 수행함에 있어 상기
                        신뢰를 바탕으로 GS칼텍스의 정보 및 비밀보호를 위해 아래 사항 엄수 준수할 것을 서약합니다.
                      </p>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>1.</strong> GS칼텍스의 영업비밀, 기술정보, 고객정보 등 일체의 정보를 외부에 누설하지
                          않겠습니다.
                        </p>
                        <p>
                          <strong>2.</strong> 업무상 취득한 정보를 개인적 목적으로 이용하지 않겠습니다.
                        </p>
                        <p>
                          <strong>3.</strong> 보안규정을 준수하고 관련 교육에 성실히 참여하겠습니다.
                        </p>
                        <p>
                          <strong>4.</strong> 계약 종료 후에도 비밀유지 의무를 지속하겠습니다.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${selectedWorkerRecord.securityPledge?.agreed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                    >
                      <strong>
                        동의 여부: {selectedWorkerRecord.securityPledge?.agreed ? "동의함" : "동의하지 않음"}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {workerModalTab === "signature" && (
                <div>
                  <h3 className="text-lg font-bold text-green-700 mb-4">디지털 서명</h3>
                  <div className="text-center">
                    <div className="border-2 border-green-300 rounded-lg p-8 bg-green-50 mb-4">
                      {selectedWorkerRecord.signature ? (
                        <img
                          src={selectedWorkerRecord.signature || "/placeholder.svg"}
                          alt="서명"
                          className="max-w-full h-32 mx-auto"
                        />
                      ) : (
                        <span className="text-gray-500">서명 없음</span>
                      )}
                    </div>
                    <p>
                      <strong>서명일시:</strong> {new Date(selectedWorkerRecord.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handlePrintAllWorkerDocuments(selectedWorkerRecord)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  전체 인쇄
                </button>
                <button
                  onClick={() => setSelectedWorkerRecord(null)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
