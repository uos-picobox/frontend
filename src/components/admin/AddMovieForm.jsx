// src/components/admin/AddMovieForm.js
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Input from "../common/Input";
import Button from "../common/Button";
import { useData } from "../../contexts/DataContext";
import { PlusCircle, Trash2 } from "lucide-react"; // For movie casts

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
  /* Copied from AddActorForm */
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
  /* Copied from AddActorForm */
  max-width: 150px;
  max-height: 225px;
  margin-top: ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const AddMovieForm = ({
  onSubmit,
  initialMovieData,
  isLoading: isSubmitting,
  actorsForSelect,
}) => {
  const {
    genres: allGenres,
    ratings: allRatings,
    distributors: allDistributors,
    isLoadingData: isLoadingGlobal,
  } = useData();
  // actorsForSelect will be passed from AdminDashboardPage (or its CRUD wrapper)
  // This form assumes `actorsForSelect` is an array of { actorId, name }

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    releaseDate: "",
    language: "한국어",
    director: "",
    distributorId: "",
    movieRatingId: "",
    genreIds: [],
    movieCasts: [{ actorId: "", role: "" }],
    // posterUrl field is removed, use posterImageFile for new/updated poster
  });
  const [posterImageFile, setPosterImageFile] = useState(null);
  const [currentPosterUrl, setCurrentPosterUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialMovieData) {
      setFormData({
        title: initialMovieData.title || "",
        description: initialMovieData.description || "",
        duration: initialMovieData.duration?.toString() || "",
        releaseDate: initialMovieData.releaseDate || "",
        language: initialMovieData.language || "한국어",
        director: initialMovieData.director || "",
        distributorId:
          initialMovieData.distributor?.distributorId?.toString() || "",
        movieRatingId: initialMovieData.movieRating?.ratingId?.toString() || "",
        genreIds: initialMovieData.genres?.map((g) => g.genreId) || [],
        movieCasts: initialMovieData.movieCasts?.map((mc) => ({
          actorId: mc.actor.actorId.toString(),
          role: mc.role,
        })) || [{ actorId: "", role: "" }],
      });
      setCurrentPosterUrl(initialMovieData.posterUrl || "");
      setPreviewUrl(initialMovieData.posterUrl || "");
      setPosterImageFile(null);
    } else {
      setFormData({
        title: "",
        description: "",
        duration: "",
        releaseDate: "",
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
  }, [initialMovieData]);

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
    if (
      formData.movieCasts.length <= 1 &&
      initialMovieData &&
      initialMovieData.movieCasts?.length === 1
    ) {
      /* Allow removing if it's not the only one from initial data */
    } else if (formData.movieCasts.length <= 1) return;

    const updatedCasts = formData.movieCasts.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      movieCasts:
        updatedCasts.length > 0 ? updatedCasts : [{ actorId: "", role: "" }],
    })); // Ensure at least one empty row if all removed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (
      !formData.title ||
      !formData.duration ||
      !formData.releaseDate ||
      !formData.distributorId ||
      !formData.movieRatingId
    ) {
      setFormError(
        "필수 항목 (제목, 상영시간, 개봉일, 배급사, 등급)을 모두 입력해주세요."
      );
      return;
    }

    const movieDetails = {
      title: formData.title,
      description: formData.description,
      duration: parseInt(formData.duration),
      releaseDate: formData.releaseDate,
      language: formData.language,
      director: formData.director,
      distributorId: parseInt(formData.distributorId),
      movieRatingId: parseInt(formData.movieRatingId),
      genreIds: formData.genreIds.map((id) => parseInt(id)),
      movieCasts: formData.movieCasts
        .filter((cast) => cast.actorId && cast.role)
        .map((cast) => ({ actorId: parseInt(cast.actorId), role: cast.role })),
    };

    const submissionData = new FormData();
    submissionData.append(
      "movieDetails",
      new Blob([JSON.stringify(movieDetails)], { type: "application/json" })
    );

    let hasNewImage = false;
    if (posterImageFile) {
      submissionData.append("posterImage", posterImageFile);
      hasNewImage = true;
    }
    // Note: API for update without image is different from update poster only.
    // This form will use `create-with-image` or `update-with-image`.
    // Separate poster update/delete can be handled by a different UI/service call.

    try {
      // onSubmit prop will call addMovieWithImage or updateMovieWithImage
      await onSubmit(submissionData, hasNewImage);
      if (!initialMovieData) {
        // Reset form only on successful add
        setFormData({
          title: "",
          description: "",
          duration: "",
          releaseDate: "",
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
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Movie form submission error: ", error);
      setFormError(
        error.message ||
          error.details ||
          "영화 정보 저장 중 오류가 발생했습니다."
      );
    }
  };

  if (
    isLoadingGlobal &&
    (!allGenres?.length || !allRatings?.length || !allDistributors?.length)
  ) {
    return <p>폼 데이터 로딩 중...</p>;
  }

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <FormSectionTitle>
        {initialMovieData ? "영화 정보 수정" : "새 영화 추가 (이미지 포함)"}
      </FormSectionTitle>
      {formError && <p style={{ color: "red" }}>{formError}</p>}
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
          name="releaseDate"
          label="개봉일"
          type="date"
          value={formData.releaseDate}
          onChange={handleChange}
          required
        />
        <Input
          name="language"
          label="언어"
          value={formData.language}
          onChange={handleChange}
        />

        <FileInputWrapper
          style={{
            gridColumn: initialMovieData
              ? "span 1"
              : "span 2" /* Full width if adding */,
          }}
        >
          <label htmlFor="posterImageFile">포스터 이미지 (선택)</label>
          <input
            type="file"
            id="posterImageFile"
            name="posterImageFile"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
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
                label={`배우 ID #${index + 1}`}
                type="select"
                value={cast.actorId}
                onChange={(e) => handleCastChange(index, e)}
                placeholder="배우 ID"
                style={{ flexGrow: 1 }}
                required={
                  index === 0 || cast.role /* Require if role is filled */
                }
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
                required={
                  index === 0 || cast.actorId /* Require if actorId is filled */
                }
              />
              {formData.movieCasts.length > 0 && (
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
          : initialMovieData
          ? "영화 정보 업데이트"
          : "영화 추가하기"}
      </Button>
    </FormWrapper>
  );
};

export default AddMovieForm;
