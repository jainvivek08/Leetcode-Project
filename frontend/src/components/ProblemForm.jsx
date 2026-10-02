import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, Link } from 'react-router';
import axiosClient, { getApiErrorMessage } from '../utils/axiosClient';
import { CANONICAL_TAGS, tagLabel } from '../utils/tags';

const ALL_LANGUAGES = ['JavaScript', 'C++', 'Java', 'Python3'];

const problemFormSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(150, 'Title cannot exceed 150 characters'),
    description: z
      .string()
      .min(1, 'Description is required')
      .max(20000, 'Description cannot exceed 20000 characters'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    tags: z
      .array(z.string())
      .min(1, 'At least 1 tag is required')
      .max(6, 'At most 6 tags allowed'),
    constraints: z.string().optional(),
    timeLimit: z.coerce
      .number()
      .min(1, 'Time limit must be at least 1 second')
      .max(10, 'Time limit cannot exceed 10 seconds'),
    memoryLimit: z.coerce
      .number()
      .min(64, 'Memory limit must be at least 64 MB')
      .max(512, 'Memory limit cannot exceed 512 MB'),
    visibleTestCases: z
      .array(
        z.object({
          input: z
            .string()
            .min(1, 'Input is required')
            .max(5000, 'Input cannot exceed 5000 characters'),
          output: z
            .string()
            .min(1, 'Output is required')
            .max(5000, 'Output cannot exceed 5000 characters'),
          explanation: z
            .string()
            .min(1, 'Explanation is required')
            .max(5000, 'Explanation cannot exceed 5000 characters'),
        })
      )
      .min(1, 'At least one visible test case required')
      .max(10, 'At most 10 visible test cases allowed'),
    hiddenTestCases: z
      .array(
        z.object({
          input: z
            .string()
            .min(1, 'Input is required')
            .max(5000, 'Input cannot exceed 5000 characters'),
          output: z
            .string()
            .min(1, 'Output is required')
            .max(5000, 'Output cannot exceed 5000 characters'),
        })
      )
      .min(1, 'At least one hidden test case required')
      .max(50, 'At most 50 hidden test cases allowed'),
    languages: z.record(
      z.string(),
      z.object({
        initialCode: z.string().optional(),
        completeCode: z.string().optional(),
      })
    ),
  })
  .superRefine((data, ctx) => {
    const startLangs = [];
    const refLangs = [];

    for (const [lang, codes] of Object.entries(data.languages || {})) {
      const initial = (codes?.initialCode || '').trim();
      const complete = (codes?.completeCode || '').trim();

      if (initial) startLangs.push(lang);
      if (complete) refLangs.push(lang);

      if (complete && !initial) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${lang} has a reference solution but is missing starter code.`,
          path: ['languages', lang, 'initialCode'],
        });
      }
    }

    if (startLangs.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one language must have starter code.',
        path: ['languages'],
      });
    }

    if (refLangs.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one language must have a reference solution.',
        path: ['languages'],
      });
    }
  });

function ProblemForm({ mode = 'create' }) {
  const { id } = useParams();

  const [loadingInitial, setLoadingInitial] = useState(mode === 'edit');
  const [initialError, setInitialError] = useState(null);
  const [originalProblem, setOriginalProblem] = useState(null);
  const [activeLangTab, setActiveLangTab] = useState('JavaScript');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const defaultValues = {
    title: '',
    description: '',
    difficulty: 'easy',
    tags: ['array'],
    constraints: '',
    timeLimit: 2,
    memoryLimit: 256,
    visibleTestCases: [{ input: '', output: '', explanation: '' }],
    hiddenTestCases: [{ input: '', output: '' }],
    languages: {
      JavaScript: { initialCode: '', completeCode: '' },
      'C++': { initialCode: '', completeCode: '' },
      Java: { initialCode: '', completeCode: '' },
      Python3: { initialCode: '', completeCode: '' },
    },
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(problemFormSchema),
    defaultValues,
  });

  // Warn on unsaved changes in edit mode (B7)
  useEffect(() => {
    if (mode !== 'edit' || !isDirty) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [mode, isDirty]);

  // Load problem in edit mode
  useEffect(() => {
    if (mode !== 'edit' || !id) return;

    let isMounted = true;
    setLoadingInitial(true);
    setInitialError(null);

    const loadProblem = async () => {
      try {
        const { data } = await axiosClient.get(`/problem/adminProblemById/${id}`);
        if (!isMounted) return;

        setOriginalProblem(data);

        // Map languages
        const mappedLanguages = {
          JavaScript: { initialCode: '', completeCode: '' },
          'C++': { initialCode: '', completeCode: '' },
          Java: { initialCode: '', completeCode: '' },
          Python3: { initialCode: '', completeCode: '' },
        };

        (data.startCode || []).forEach((sc) => {
          const matchedLang = ALL_LANGUAGES.find(
            (l) => l.toLowerCase() === (sc.language || '').toLowerCase()
          );
          if (matchedLang) {
            mappedLanguages[matchedLang].initialCode = sc.initialCode || '';
          }
        });

        (data.referenceSolution || []).forEach((rs) => {
          const matchedLang = ALL_LANGUAGES.find(
            (l) => l.toLowerCase() === (rs.language || '').toLowerCase()
          );
          if (matchedLang) {
            mappedLanguages[matchedLang].completeCode = rs.completeCode || '';
          }
        });

        reset({
          title: data.title || '',
          description: data.description || '',
          difficulty: data.difficulty || 'easy',
          tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : ['array'],
          constraints: Array.isArray(data.constraints) ? data.constraints.join('\n') : '',
          timeLimit: data.timeLimit != null ? data.timeLimit : 2,
          memoryLimit: data.memoryLimit != null ? data.memoryLimit : 256,
          visibleTestCases:
            Array.isArray(data.visibleTestCases) && data.visibleTestCases.length > 0
              ? data.visibleTestCases.map((tc) => ({
                  input: tc.input || '',
                  output: tc.output || '',
                  explanation: tc.explanation || '',
                }))
              : [{ input: '', output: '', explanation: '' }],
          hiddenTestCases:
            Array.isArray(data.hiddenTestCases) && data.hiddenTestCases.length > 0
              ? data.hiddenTestCases.map((tc) => ({
                  input: tc.input || '',
                  output: tc.output || '',
                }))
              : [{ input: '', output: '' }],
          languages: mappedLanguages,
        });
      } catch (err) {
        if (!isMounted) return;
        setInitialError(getApiErrorMessage(err) || 'Failed to load problem');
      } finally {
        if (isMounted) {
          setLoadingInitial(false);
        }
      }
    };

    loadProblem();

    return () => {
      isMounted = false;
    };
  }, [mode, id, reset]);

  const selectedTags = watch('tags') || [];

  const handleToggleTag = (tag) => {
    let nextTags;
    if (selectedTags.includes(tag)) {
      nextTags = selectedTags.filter((t) => t !== tag);
    } else {
      if (selectedTags.length >= 6) {
        alert('You can select at most 6 tags.');
        return;
      }
      nextTags = [...selectedTags, tag];
    }
    setValue('tags', nextTags, { shouldValidate: true, shouldDirty: true });
  };

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible,
  } = useFieldArray({
    control,
    name: 'visibleTestCases',
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden,
  } = useFieldArray({
    control,
    name: 'hiddenTestCases',
  });

  // Check if test cases or reference solution changed for the confirmation dialog (B4)
  const hasTcOrRefChanged = (orig, nextPayload) => {
    if (!orig) return false;

    // Compare visible
    const origVis = (orig.visibleTestCases || []).map((c) => ({
      input: String(c.input || '').trim(),
      output: String(c.output || '').trim(),
      explanation: String(c.explanation || '').trim(),
    }));
    const newVis = (nextPayload.visibleTestCases || []).map((c) => ({
      input: String(c.input || '').trim(),
      output: String(c.output || '').trim(),
      explanation: String(c.explanation || '').trim(),
    }));
    if (JSON.stringify(origVis) !== JSON.stringify(newVis)) return true;

    // Compare hidden
    const origHid = (orig.hiddenTestCases || []).map((c) => ({
      input: String(c.input || '').trim(),
      output: String(c.output || '').trim(),
    }));
    const newHid = (nextPayload.hiddenTestCases || []).map((c) => ({
      input: String(c.input || '').trim(),
      output: String(c.output || '').trim(),
    }));
    if (JSON.stringify(origHid) !== JSON.stringify(newHid)) return true;

    // Compare reference solutions
    const origRef = (orig.referenceSolution || [])
      .map((r) => ({
        language: (r.language || '').toLowerCase().trim(),
        completeCode: String(r.completeCode || '').replace(/\r\n/g, '\n').trim(),
      }))
      .sort((a, b) => a.language.localeCompare(b.language));
    const newRef = (nextPayload.referenceSolution || [])
      .map((r) => ({
        language: (r.language || '').toLowerCase().trim(),
        completeCode: String(r.completeCode || '').replace(/\r\n/g, '\n').trim(),
      }))
      .sort((a, b) => a.language.localeCompare(b.language));
    if (JSON.stringify(origRef) !== JSON.stringify(newRef)) return true;

    return false;
  };

  const onSubmit = async (formData) => {
    setErrorMessage(null);

    // Build arrays from languages
    const startCode = [];
    const referenceSolution = [];

    for (const [lang, codes] of Object.entries(formData.languages || {})) {
      const initial = (codes?.initialCode || '').trim();
      const complete = (codes?.completeCode || '').trim();
      if (initial) {
        startCode.push({ language: lang, initialCode: codes.initialCode });
      }
      if (complete) {
        referenceSolution.push({ language: lang, completeCode: codes.completeCode });
      }
    }

    const constraintsList = formData.constraints
      ? formData.constraints
          .split('\n')
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      difficulty: formData.difficulty,
      tags: formData.tags,
      constraints: constraintsList,
      timeLimit: Number(formData.timeLimit) || 2,
      memoryLimit: Number(formData.memoryLimit) || 256,
      visibleTestCases: formData.visibleTestCases,
      hiddenTestCases: formData.hiddenTestCases,
      startCode,
      referenceSolution,
    };

    // Warn with confirm dialog in edit mode if test cases or reference solutions were modified (B4)
    if (mode === 'edit' && originalProblem) {
      const changed = hasTcOrRefChanged(originalProblem, payload);
      if (changed) {
        const confirmed = window.confirm(
          'This will re-run verification on Judge0 and may take a while. Continue?'
        );
        if (!confirmed) return;
      }
    }

    try {
      setIsSaving(true);
      if (mode === 'edit') {
        const res = await axiosClient.put(`/problem/update/${id}`, payload);
        const updatedProblem = res.data?.problem || res.data;
        const reverified = res.data?.reverified;
        setSuccessData({
          _id: updatedProblem._id || id,
          problemNumber: updatedProblem.problemNumber || originalProblem.problemNumber,
          slug: updatedProblem.slug || originalProblem.slug,
          title: updatedProblem.title || payload.title,
          reverified,
        });
        // Update original problem reference to current saved state
        setOriginalProblem((prev) => ({
          ...prev,
          ...payload,
          problemNumber: updatedProblem.problemNumber || prev?.problemNumber,
          slug: updatedProblem.slug || prev?.slug,
        }));
      } else {
        const res = await axiosClient.post('/problem/create', payload);
        const createdProblem = res.data?.problem || res.data;
        setSuccessData({
          _id: createdProblem._id,
          problemNumber: createdProblem.problemNumber,
          slug: createdProblem.slug,
          title: createdProblem.title || payload.title,
          reverified: true,
        });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err) || 'Failed to save problem');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="container mx-auto p-6 max-w-5xl flex flex-col justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
        <p className="text-base-content/70">Loading problem details...</p>
      </div>
    );
  }

  if (initialError) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="alert alert-error shadow-lg my-6">
          <span>{initialError}</span>
        </div>
        <Link to="/admin/update" className="btn btn-outline">
          &larr; Back to Problem List
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">
              {mode === 'edit'
                ? `Edit Problem #${originalProblem?.problemNumber || ''} - ${originalProblem?.title || ''}`
                : 'Create New Problem'}
            </h1>
          </div>
          {mode === 'edit' && originalProblem && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="badge badge-neutral text-xs font-mono">
                Slug: {originalProblem.slug}
              </span>
              <span className="text-xs text-base-content/60">
                (Slug and number cannot be changed)
              </span>
            </div>
          )}
        </div>
        <Link to={mode === 'edit' ? '/admin/update' : '/admin'} className="btn btn-sm btn-ghost">
          &larr; {mode === 'edit' ? 'Problem List' : 'Admin Panel'}
        </Link>
      </div>

      {/* Success Banner (B4) */}
      {successData && (
        <div className="alert alert-success shadow-lg mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="font-bold text-base">
              {mode === 'edit'
                ? 'Problem updated successfully!'
                : 'Problem created successfully!'}
            </div>
            <div className="text-xs sm:text-sm mt-1">
              {successData.reverified !== undefined && (
                <span className="mr-2">
                  {successData.reverified
                    ? '⚡ Verified with Judge0.'
                    : '✓ Saved without Judge0 re-verification (test cases & solutions unchanged).'}
                </span>
              )}
              <Link
                to={`/problem/${successData.slug || successData._id}`}
                className="underline font-semibold hover:text-white inline-flex items-center gap-1"
              >
                View Problem #{successData.problemNumber}: {successData.title} &rarr;
              </Link>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessData(null)}
            className="btn btn-xs btn-ghost self-end sm:self-center"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="alert alert-error shadow-lg mb-6 flex items-center justify-between">
          <span className="text-sm font-semibold">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="btn btn-xs btn-ghost"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Title (1 - 150 chars)</span>
              </label>
              <input
                {...register('title')}
                className={`input input-bordered ${errors.title && 'input-error'}`}
                placeholder="e.g. Two Sum"
              />
              {errors.title && (
                <span className="text-error text-xs mt-1">{errors.title.message}</span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Description (1 - 20000 chars)
                </span>
              </label>
              <textarea
                {...register('description')}
                className={`textarea textarea-bordered h-36 ${errors.description && 'textarea-error'}`}
                placeholder="Problem statement and details..."
              />
              {errors.description && (
                <span className="text-error text-xs mt-1">
                  {errors.description.message}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Difficulty</span>
                </label>
                <select
                  {...register('difficulty')}
                  className={`select select-bordered ${errors.difficulty && 'select-error'}`}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Time Limit (1 - 10s)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  {...register('timeLimit')}
                  className={`input input-bordered ${errors.timeLimit && 'input-error'}`}
                />
                {errors.timeLimit && (
                  <span className="text-error text-xs mt-1">
                    {errors.timeLimit.message}
                  </span>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Memory Limit (64 - 512 MB)
                  </span>
                </label>
                <input
                  type="number"
                  min="64"
                  max="512"
                  {...register('memoryLimit')}
                  className={`input input-bordered ${errors.memoryLimit && 'input-error'}`}
                />
                {errors.memoryLimit && (
                  <span className="text-error text-xs mt-1">
                    {errors.memoryLimit.message}
                  </span>
                )}
              </div>
            </div>

            {/* Constraints Textarea */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Constraints (one per line, max 20 items, max 300 chars each)
                </span>
              </label>
              <textarea
                {...register('constraints')}
                className="textarea textarea-bordered h-24 font-mono text-xs"
                placeholder={
                  '1 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.'
                }
              />
            </div>

            {/* Multi-Select Tags */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Topics / Tags ({selectedTags.length}/6 selected, min 1)
                </span>
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-base-200/50 rounded-xl border border-base-300">
                {CANONICAL_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleToggleTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-base-100 text-base-content border-base-300 hover:bg-base-200'
                      }`}
                    >
                      {tagLabel(tag)} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
              {errors.tags && (
                <span className="text-error text-xs mt-1">{errors.tags.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Cases</h2>

          {/* Visible Test Cases */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Visible Test Cases</h3>
                <p className="text-xs text-base-content/60">
                  {visibleFields.length}/10 test cases (min 1, max 10)
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (visibleFields.length < 10) {
                    appendVisible({ input: '', output: '', explanation: '' });
                  }
                }}
                disabled={visibleFields.length >= 10}
                className="btn btn-primary btn-sm"
              >
                Add Visible Case
              </button>
            </div>

            {errors.visibleTestCases && !Array.isArray(errors.visibleTestCases) && (
              <span className="text-error text-xs block">
                {errors.visibleTestCases.message}
              </span>
            )}

            {visibleFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-2 bg-base-200/20">
                <div className="flex justify-between">
                  <span className="font-medium">Case {index + 1}</span>
                  {visibleFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVisible(index)}
                      className="btn btn-ghost btn-xs text-error"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Input (max 5000 chars)</span>
                    </label>
                    <textarea
                      {...register(`visibleTestCases.${index}.input`)}
                      className="textarea textarea-bordered font-mono text-xs"
                      rows="2"
                    />
                    {errors.visibleTestCases?.[index]?.input && (
                      <span className="text-error text-xs mt-1">
                        {errors.visibleTestCases[index].input.message}
                      </span>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Output (max 5000 chars)</span>
                    </label>
                    <textarea
                      {...register(`visibleTestCases.${index}.output`)}
                      className="textarea textarea-bordered font-mono text-xs"
                      rows="2"
                    />
                    {errors.visibleTestCases?.[index]?.output && (
                      <span className="text-error text-xs mt-1">
                        {errors.visibleTestCases[index].output.message}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Explanation</span>
                  </label>
                  <textarea
                    {...register(`visibleTestCases.${index}.explanation`)}
                    className="textarea textarea-bordered text-xs"
                    rows="2"
                  />
                  {errors.visibleTestCases?.[index]?.explanation && (
                    <span className="text-error text-xs mt-1">
                      {errors.visibleTestCases[index].explanation.message}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Hidden Test Cases */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Hidden Test Cases</h3>
                <p className="text-xs text-base-content/60">
                  {hiddenFields.length}/50 test cases (min 1, max 50)
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (hiddenFields.length < 50) {
                    appendHidden({ input: '', output: '' });
                  }
                }}
                disabled={hiddenFields.length >= 50}
                className="btn btn-primary btn-sm"
              >
                Add Hidden Case
              </button>
            </div>

            {errors.hiddenTestCases && !Array.isArray(errors.hiddenTestCases) && (
              <span className="text-error text-xs block">
                {errors.hiddenTestCases.message}
              </span>
            )}

            {hiddenFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-2 bg-base-200/20">
                <div className="flex justify-between">
                  <span className="font-medium">Hidden Case {index + 1}</span>
                  {hiddenFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHidden(index)}
                      className="btn btn-ghost btn-xs text-error"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Input (max 5000 chars)</span>
                    </label>
                    <textarea
                      {...register(`hiddenTestCases.${index}.input`)}
                      className="textarea textarea-bordered font-mono text-xs"
                      rows="2"
                    />
                    {errors.hiddenTestCases?.[index]?.input && (
                      <span className="text-error text-xs mt-1">
                        {errors.hiddenTestCases[index].input.message}
                      </span>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Output (max 5000 chars)</span>
                    </label>
                    <textarea
                      {...register(`hiddenTestCases.${index}.output`)}
                      className="textarea textarea-bordered font-mono text-xs"
                      rows="2"
                    />
                    {errors.hiddenTestCases?.[index]?.output && (
                      <span className="text-error text-xs mt-1">
                        {errors.hiddenTestCases[index].output.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Templates & Reference Solutions */}
        <div className="card bg-base-100 shadow-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h2 className="text-xl font-semibold">Languages & Code Templates</h2>
              <p className="text-xs text-base-content/70">
                JavaScript, C++, Java, and Python3. At least one reference solution is
                required, and every reference language must have starter code.
              </p>
            </div>
          </div>

          {errors.languages?.message && (
            <div className="alert alert-error text-xs mb-4 py-2">
              <span>{errors.languages.message}</span>
            </div>
          )}

          {/* Language Selector Tabs (B2) */}
          <div className="flex flex-wrap gap-2 mb-4 border-b border-base-300 pb-3">
            {ALL_LANGUAGES.map((lang) => {
              const hasStart = Boolean(watch(`languages.${lang}.initialCode`)?.trim());
              const hasRef = Boolean(watch(`languages.${lang}.completeCode`)?.trim());
              const isSelected = activeLangTab === lang;

              return (
                <button
                  type="button"
                  key={lang}
                  onClick={() => setActiveLangTab(lang)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition border flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-primary-content border-primary shadow'
                      : 'bg-base-200 text-base-content border-base-300 hover:bg-base-300'
                  }`}
                >
                  <span>{lang}</span>
                  {hasStart && hasRef ? (
                    <span className="badge badge-success badge-xs">✓ Ready</span>
                  ) : hasStart ? (
                    <span className="badge badge-info badge-xs">Start only</span>
                  ) : hasRef ? (
                    <span className="badge badge-warning badge-xs">Ref only</span>
                  ) : (
                    <span className="badge badge-ghost badge-xs">empty</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Language Editor */}
          <div className="border p-4 rounded-xl bg-base-200/20 space-y-4">
            <div className="flex justify-between items-center border-b border-base-300 pb-2">
              <span className="font-semibold text-base flex items-center gap-2">
                <span>{activeLangTab}</span>
                <span className="text-xs font-normal text-base-content/60">
                  (Leave both textareas blank if this language is not provided)
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setValue(`languages.${activeLangTab}.initialCode`, '', {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue(`languages.${activeLangTab}.completeCode`, '', {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                className="btn btn-ghost btn-xs text-error"
              >
                Clear {activeLangTab}
              </button>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Initial Code (Starter Template)</span>
              </label>
              <textarea
                {...register(`languages.${activeLangTab}.initialCode`)}
                className={`textarea textarea-bordered font-mono h-36 ${
                  errors.languages?.[activeLangTab]?.initialCode && 'textarea-error'
                }`}
                placeholder={`// Starter code for ${activeLangTab}`}
              />
              {errors.languages?.[activeLangTab]?.initialCode && (
                <span className="text-error text-xs mt-1">
                  {errors.languages[activeLangTab].initialCode.message}
                </span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Reference Solution (Complete Working Code)
                </span>
              </label>
              <textarea
                {...register(`languages.${activeLangTab}.completeCode`)}
                className="textarea textarea-bordered font-mono h-48"
                placeholder={`// Complete accepted solution for ${activeLangTab} for Judge0 verification`}
              />
              {errors.languages?.[activeLangTab]?.completeCode && (
                <span className="text-error text-xs mt-1">
                  {errors.languages[activeLangTab].completeCode.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button (B4) */}
        <button
          type="submit"
          disabled={isSaving}
          className="btn btn-primary w-full text-base font-semibold"
        >
          {isSaving ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              <span>Verifying with Judge0...</span>
            </>
          ) : mode === 'edit' ? (
            'Update Problem'
          ) : (
            'Create Problem'
          )}
        </button>
      </form>
    </div>
  );
}

export default ProblemForm;
