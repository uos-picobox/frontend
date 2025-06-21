// src/components/admin/AddMovieForm.js
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Input from "../common/Input";
import Button from "../common/Button";
import { useData } from "../../contexts/DataContext";
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing[4]};
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FullWidth = styled.div`
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-column: 1 / -1;
  }
`;

const CheckboxGroup = styled.div`
  label {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textDark};
    margin-bottom: ${({ theme }) => theme.spacing[1.5]};
  }
  .options-container {
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing[3]};
    max-height: 150px;
    overflow-y: auto;
    background-color: ${({ theme }) => theme.colors.surfaceLight};
    padding: ${({ theme }) => theme.spacing[2]};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
  }
  .option {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[1.5]};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.textDark};
    input[type="checkbox"] {
      width: auto;
      accent-color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const MovieCastInputGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.surfaceLight};
`;

const MovieCastRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: flex-end;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const FileInputWrapper = styled.div`
  label {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textDark};
    margin-bottom: ${({ theme }) => theme.spacing[1.5]};
  }
  input[type="file"] {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    padding: ${({ theme }) => theme.spacing[1.5]}
      ${({ theme }) => theme.spacing[2]};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    background-color: ${({ theme }) => theme.colors.surfaceLight};
  }
`;

const ImagePreview = styled.img`
  max-width: 150px;
  max-height: 225px;
  margin-top: ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ErrorMessageText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  background-color: ${({ theme }) => theme.colors.error + "20"};
  border: 1px solid ${({ theme }) => theme.colors.error + "50"};
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;
`;

const AddMovieForm = ({
  onSubmit,
  initialData, // prop 이름을 initialMovieData에서 initialData로 변경
  isLoading: isSubmitting,
  actorsForSelect,
}) => {
  const {
    genres: allGenres,
    ratings: allRatings,
    distributors: allDistributors,
    isLoadingData: isLoadingGlobal,
  } = useData();

  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    releaseDate: "",
    screeningEndDate: "",
    language: "한국어",
    director: "",
    distributorId: "",
    movieRatingId: "",
    genreIds: [],
    movieCasts: [{ actorId: "", role: "" }],
  });
  const [posterImageFile, setPosterImageFile] = useState(null);
  const [currentPosterUrl, setCurrentPosterUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    // prop 이름 변경에 따라 initialData를 사용하도록 수정
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        duration: initialData.duration?.toString() || "",
        releaseDate: initialData.releaseDate || "",
        screeningEndDate: initialData.screeningEndDate || "",
        language: initialData.language || "한국어",
        director: initialData.director || "",
        distributorId: initialData.distributor?.distributorId?.toString() || "",
        movieRatingId: initialData.movieRating?.ratingId?.toString() || "",
        genreIds: initialData.genres?.map((g) => g.genreId) || [],
        movieCasts:
          initialData.movieCasts?.length > 0
            ? initialData.movieCasts.map((mc) => ({
                actorId: mc.actor.actorId.toString(),
                role: mc.role,
              }))
            : [{ actorId: "", role: "" }],
      });
      setCurrentPosterUrl(initialData.posterUrl || "");
      setPreviewUrl(initialData.posterUrl || "");
      setPosterImageFile(null); // 수정 모드 시작 시에는 파일 선택 초기화
      if (fileInputRef.current) fileInputRef.current.value = ""; // 파일 선택 input도 초기화
    } else {
      // 추가 모드일 때 폼 초기화
      setFormData({
        title: "",
        description: "",
        duration: "",
        releaseDate: "",
        screeningEndDate: "",
        language: "한국어",
        director: "",
        distributorId: "",
        movieRatingId: "",
        genreIds: [],
        movieCasts: [{ actorId: "", role: "" }],
      });
      setCurrentPosterUrl("");
      setPreviewUrl("");
      setPosterImageFile(null);
    }
  }, [initialData]); // 의존성 배열도 initialData로 변경

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "genreIds") {
      const id = parseInt(value);
      setFormData((prev) => ({
        ...prev,
        genreIds: checked
          ? [...prev.genreIds, id]
          : prev.genreIds.filter((gid) => gid !== id),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setCurrentPosterUrl("");
    } else {
      setPosterImageFile(null);
      setPreviewUrl(currentPosterUrl);
    }
  };

  const handleCastChange = (index, e) => {
    const { name, value } = e.target;
    const updatedCasts = [...formData.movieCasts];
    updatedCasts[index][name] = value;
    setFormData((prev) => ({ ...prev, movieCasts: updatedCasts }));
  };
  const addCastMember = () =>
    setFormData((prev) => ({
      ...prev,
      movieCasts: [...prev.movieCasts, { actorId: "", role: "" }],
    }));
  const removeCastMember = (index) => {
    if (formData.movieCasts.length <= 1) return;
    const updatedCasts = formData.movieCasts.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, movieCasts: updatedCasts }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const requiredFields = {
      title: "제목",
      duration: "상영시간",
      releaseDate: "개봉일",
      distributorId: "배급사",
      movieRatingId: "관람 등급",
    };
    for (const [field, name] of Object.entries(requiredFields)) {
      if (!formData[field]) {
        setFormError(`필수 항목 (${name})을 모두 입력해주세요.`);
        return;
      }
    }

    if (!isEditMode && !posterImageFile) {
      setFormError("새 영화를 추가하려면 포스터 이미지가 필수입니다.");
      return;
    }

    const movieDetails = {
      title: formData.title,
      description: formData.description,
      duration: parseInt(formData.duration, 10),
      releaseDate: formData.releaseDate,
      screeningEndDate: formData.screeningEndDate,
      language: formData.language,
      director: formData.director,
      distributorId: parseInt(formData.distributorId, 10),
      movieRatingId: parseInt(formData.movieRatingId, 10),
      genreIds: formData.genreIds.map((id) => parseInt(id, 10)),
      movieCasts: formData.movieCasts
        .filter((cast) => cast.actorId && cast.role)
        .map((cast) => ({
          actorId: parseInt(cast.actorId, 10),
          role: cast.role,
        })),
    };
    console.log(movieDetails);

    try {
      const hasNewImage = !!posterImageFile;

      if (hasNewImage) {
        const submissionData = new FormData();
        submissionData.append(
          "movieDetails",
          new Blob([JSON.stringify(movieDetails)], { type: "application/json" })
        );
        submissionData.append("posterImage", posterImageFile);

        await onSubmit(submissionData, true);
      } else {
        await onSubmit(movieDetails, false);
      }

      if (!isEditMode) {
        setFormData({
          title: "",
          description: "",
          duration: "",
          releaseDate: "",
          screeningEndDate: "",
          language: "한국어",
          director: "",
          distributorId: "",
          movieRatingId: "",
          genreIds: [],
          movieCasts: [{ actorId: "", role: "" }],
        });
        setPosterImageFile(null);
        setPreviewUrl("");
        setCurrentPosterUrl("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Movie form submission error: ", error);
      setFormError(
        error.response?.data?.message ||
          error.message ||
          "영화 정보 저장 중 오류가 발생했습니다."
      );
    }
  };

  if (isLoadingGlobal) {
    return <p>폼 데이터 로딩 중...</p>;
  }

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <FormSectionTitle>
        {isEditMode ? "영화 정보 수정" : "새 영화 추가"}
      </FormSectionTitle>
      {formError && <ErrorMessageText>{formError}</ErrorMessageText>}
      <Grid>
        <Input
          name="title"
          label="제목"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <Input
          name="director"
          label="감독"
          value={formData.director}
          onChange={handleChange}
        />
        <Input
          name="duration"
          label="상영 시간 (분)"
          type="number"
          value={formData.duration}
          onChange={handleChange}
          required
        />
        <Input
          name="language"
          label="언어"
          value={formData.language}
          onChange={handleChange}
        />
        <Input
          name="releaseDate"
          label="개봉일"
          type="date"
          value={formData.releaseDate}
          onChange={handleChange}
          required
        />
        <Input
          name="screeningEndDate"
          label="상영 종료일"
          type="date"
          value={formData.screeningEndDate}
          onChange={handleChange}
        />
        <FileInputWrapper
          style={{ gridColumn: isEditMode ? "span 1" : "span 2" }}
        >
          <label htmlFor="posterImageFile">
            포스터 이미지 {isEditMode ? "(변경 시에만 선택)" : "(필수)"}
          </label>
          <input
            type="file"
            id="posterImageFile"
            name="posterImageFile"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            required={!isEditMode}
          />
          {(previewUrl || currentPosterUrl) && (
            <ImagePreview
              src={previewUrl || currentPosterUrl}
              alt="포스터 미리보기"
            />
          )}
        </FileInputWrapper>
      </Grid>
      <FullWidth>
        <Input
          name="description"
          label="줄거리"
          type="textarea"
          value={formData.description}
          onChange={handleChange}
        />
      </FullWidth>
      <Grid>
        <Input
          name="distributorId"
          label="배급사"
          type="select"
          value={formData.distributorId}
          onChange={handleChange}
          required
        >
          <option value="">배급사 선택</option>
          {allDistributors?.map((d) => (
            <option key={d.distributorId} value={d.distributorId}>
              {d.name}
            </option>
          ))}
        </Input>
        <Input
          name="movieRatingId"
          label="관람 등급"
          type="select"
          value={formData.movieRatingId}
          onChange={handleChange}
          required
        >
          <option value="">등급 선택</option>
          {allRatings?.map((r) => (
            <option key={r.ratingId} value={r.ratingId}>
              {r.ratingName}
            </option>
          ))}
        </Input>
      </Grid>
      <FullWidth>
        <CheckboxGroup>
          <label>장르 (다중 선택 가능)</label>
          <div className="options-container">
            {allGenres?.map((genre) => (
              <div className="option" key={genre.genreId}>
                <input
                  type="checkbox"
                  id={`genre-${genre.genreId}`}
                  name="genreIds"
                  value={genre.genreId}
                  checked={formData.genreIds.includes(genre.genreId)}
                  onChange={handleChange}
                />
                <label htmlFor={`genre-${genre.genreId}`}>
                  {genre.genreName}
                </label>
              </div>
            ))}
          </div>
        </CheckboxGroup>
      </FullWidth>
      <FullWidth>
        <label
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--text-dark-color)",
            marginBottom: "0.75rem",
          }}
        >
          출연진 (MovieCasts)
        </label>
        {formData.movieCasts.map((cast, index) => (
          <MovieCastInputGroup key={index}>
            <MovieCastRow>
              <Input
                name="actorId"
                label={`배우 #${index + 1}`}
                type="select"
                value={cast.actorId}
                onChange={(e) => handleCastChange(index, e)}
                style={{ flexGrow: 1 }}
                required={index === 0 || !!cast.role}
              >
                <option value="">배우 선택</option>
                {actorsForSelect?.map((actor) => (
                  <option key={actor.actorId} value={actor.actorId}>
                    {actor.name} (ID: {actor.actorId})
                  </option>
                ))}
              </Input>
              <Input
                name="role"
                label={`역할 #${index + 1}`}
                value={cast.role}
                onChange={(e) => handleCastChange(index, e)}
                placeholder="역할 (예: 마석도)"
                style={{ flexGrow: 2 }}
                required={index === 0 || !!cast.actorId}
              />
              {formData.movieCasts.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeCastMember(index)}
                  style={{ alignSelf: "flex-end", marginBottom: "1.25rem" }}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </MovieCastRow>
          </MovieCastInputGroup>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCastMember}
          iconLeft={<PlusCircle size={16} />}
          style={{ marginTop: "0.5rem" }}
        >
          출연진 추가
        </Button>
      </FullWidth>
      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={isSubmitting || isLoadingGlobal}
      >
        {isSubmitting
          ? "저장 중..."
          : isEditMode
          ? "영화 정보 업데이트"
          : "영화 추가하기"}
      </Button>
    </FormWrapper>
  );
};

export default AddMovieForm;
