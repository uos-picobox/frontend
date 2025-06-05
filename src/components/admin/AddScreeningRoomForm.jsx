// src/components/admin/AddScreeningRoomForm.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Input from "../common/Input";
import Button from "../common/Button";
import { PlusCircle, Trash2 } from "lucide-react";

const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[4]};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const FormSectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  padding-bottom: ${({ theme }) => theme.spacing[2]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const RowDefinitionGroup = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
`;

const RowDefinitionItem = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};

  &:last-child {
    margin-bottom: 0;
  }
`;

const AddScreeningRoomForm = ({
  onSubmit,
  initialRoomData,
  isLoading: isSubmitting,
}) => {
  const [roomName, setRoomName] = useState("");
  const [rowDefinitions, setRowDefinitions] = useState([
    { rowIdentifier: "A", numberOfSeats: 10 },
  ]);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialRoomData) {
      setRoomName(initialRoomData.roomName || "");
      // API 응답의 seatLayout (ScreeningRoomResponseDto)을 rowDefinitions (ScreeningRoomRequestDto) 형식으로 변환
      const initialRowDefs =
        initialRoomData.seatLayout || initialRoomData.rowDefinitions;
      setRowDefinitions(
        initialRowDefs && initialRowDefs.length > 0
          ? initialRowDefs
          : [{ rowIdentifier: "A", numberOfSeats: 10 }]
      );
    } else {
      setRoomName("");
      setRowDefinitions([{ rowIdentifier: "A", numberOfSeats: 10 }]);
    }
  }, [initialRoomData]);

  const handleRowDefChange = (index, field, value) => {
    const updatedRowDefs = [...rowDefinitions];
    if (field === "numberOfSeats") {
      updatedRowDefs[index][field] = parseInt(value, 10) || 0;
    } else {
      // rowIdentifier는 대문자 한 글자로 제한하는 것이 일반적이나, API 명세에 따름
      updatedRowDefs[index][field] = value.toUpperCase().trim();
    }
    setRowDefinitions(updatedRowDefs);
  };

  const addRowDefinition = () => {
    const lastIdentifier =
      rowDefinitions.length > 0
        ? rowDefinitions[rowDefinitions.length - 1].rowIdentifier
        : "@";
    const nextIdentifier =
      lastIdentifier && lastIdentifier.length === 1
        ? String.fromCharCode(lastIdentifier.charCodeAt(0) + 1)
        : `R${rowDefinitions.length + 1}`;
    setRowDefinitions([
      ...rowDefinitions,
      { rowIdentifier: nextIdentifier, numberOfSeats: 10 },
    ]);
  };

  const removeRowDefinition = (index) => {
    if (rowDefinitions.length <= 1) {
      setFormError("최소 한 개의 좌석 행 정의가 필요합니다.");
      return;
    }
    const updatedRowDefs = rowDefinitions.filter((_, i) => i !== index);
    setRowDefinitions(updatedRowDefs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!roomName.trim()) {
      setFormError("상영관 이름을 입력해주세요.");
      return;
    }
    if (
      rowDefinitions.some(
        (def) =>
          !def.rowIdentifier ||
          def.rowIdentifier.trim() === "" ||
          !def.numberOfSeats ||
          def.numberOfSeats <= 0
      )
    ) {
      setFormError(
        "모든 좌석 행의 식별자와 좌석 수를 올바르게 입력해주세요 (좌석 수는 1 이상)."
      );
      return;
    }
    // Check for duplicate row identifiers
    const identifiers = rowDefinitions.map((def) => def.rowIdentifier.trim());
    if (new Set(identifiers).size !== identifiers.length) {
      setFormError(
        "중복된 행 식별자가 있습니다. 각 행 식별자는 고유해야 합니다."
      );
      return;
    }

    const requestData = {
      // ScreeningRoomRequestDto
      roomName: roomName.trim(),
      rowDefinitions: rowDefinitions.map((def) => ({
        rowIdentifier: def.rowIdentifier.trim(),
        numberOfSeats: Number(def.numberOfSeats),
      })),
    };

    try {
      await onSubmit(requestData); // This is addScreeningRoom or updateScreeningRoom
      if (!initialRoomData) {
        setRoomName("");
        setRowDefinitions([{ rowIdentifier: "A", numberOfSeats: 10 }]);
      }
    } catch (error) {
      console.error("Screening room form submission error:", error);
      setFormError(
        error.message || error.details || "상영관 저장 중 오류가 발생했습니다."
      );
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <FormSectionTitle>
        {initialRoomData ? "상영관 정보 수정" : "새 상영관 추가"}
      </FormSectionTitle>
      {formError && <p style={{ color: "red" }}>{formError}</p>}
      <Input
        label="상영관 이름"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        maxLength="50"
        required
      />

      <div>
        <label
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--text-dark-color)",
            marginBottom: "0.75rem",
          }}
        >
          좌석 배치 정의 (Row Definitions)
        </label>
        {rowDefinitions.map((def, index) => (
          <RowDefinitionGroup key={index}>
            <RowDefinitionItem>
              <Input
                label={`행 식별자 #${index + 1}`}
                value={def.rowIdentifier}
                onChange={(e) =>
                  handleRowDefChange(index, "rowIdentifier", e.target.value)
                }
                maxLength="1" // API 명세에 따르면 한 글자 (A, B 등)
                placeholder="예: A"
                style={{ textTransform: "uppercase", width: "120px" }}
                required
              />
              <Input
                label={`좌석 수 #${index + 1}`}
                type="number"
                value={def.numberOfSeats.toString()}
                onChange={(e) =>
                  handleRowDefChange(index, "numberOfSeats", e.target.value)
                }
                min="1"
                style={{ width: "120px" }}
                required
              />
              {rowDefinitions.length > 0 && ( // Always show delete if more than 0, but disable if only one
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeRowDefinition(index)}
                  disabled={rowDefinitions.length <= 1}
                  style={{ alignSelf: "flex-end", marginBottom: "1.25rem" }}
                >
                  <Trash2 size={16} /> 행 삭제
                </Button>
              )}
            </RowDefinitionItem>
          </RowDefinitionGroup>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRowDefinition}
          iconLeft={<PlusCircle size={16} />}
        >
          좌석 행 추가
        </Button>
      </div>

      <Button type="submit" variant="primary" fullWidth disabled={isSubmitting}>
        {isSubmitting
          ? "저장 중..."
          : initialRoomData
          ? "상영관 정보 업데이트"
          : "상영관 추가하기"}
      </Button>
    </FormWrapper>
  );
};

export default AddScreeningRoomForm;
