import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient, { getApiErrorMessage } from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import { CANONICAL_TAGS, tagLabel } from '../utils/tags';

// Zod schema matching the problem schema
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
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
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required'),
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required'),
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required'),
    })
  ).length(3, 'All three languages required'),
});

function AdminPanel() {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      difficulty: 'easy',
      tags: ['array'],
      constraints: '',
      timeLimit: 2,
      memoryLimit: 256,
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' },
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' },
      ],
    },
  });

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
    setValue('tags', nextTags, { shouldValidate: true });
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

  const onSubmit = async (data) => {
    try {
      const constraintsList = data.constraints
        ? data.constraints.split('\n').map((c) => c.trim()).filter(Boolean)
        : [];

      const payload = {
        ...data,
        constraints: constraintsList,
        timeLimit: Number(data.timeLimit) || 2,
        memoryLimit: Number(data.memoryLimit) || 256,
      };

      await axiosClient.post('/problem/create', payload);
      alert('Problem created successfully!');
      navigate('/');
    } catch (error) {
      alert(`Error: ${getApiErrorMessage(error)}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Create New Problem</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Title</span>
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
                <span className="label-text font-semibold">Description</span>
              </label>
              <textarea
                {...register('description')}
                className={`textarea textarea-bordered h-32 ${errors.description && 'textarea-error'}`}
                placeholder="Problem statement and details..."
              />
              {errors.description && (
                <span className="text-error text-xs mt-1">{errors.description.message}</span>
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
                  <span className="text-error text-xs mt-1">{errors.timeLimit.message}</span>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Memory Limit (64 - 512 MB)</span>
                </label>
                <input
                  type="number"
                  min="64"
                  max="512"
                  {...register('memoryLimit')}
                  className={`input input-bordered ${errors.memoryLimit && 'input-error'}`}
                />
                {errors.memoryLimit && (
                  <span className="text-error text-xs mt-1">{errors.memoryLimit.message}</span>
                )}
              </div>
            </div>

            {/* Constraints Textarea */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Constraints (one per line, max 20)
                </span>
              </label>
              <textarea
                {...register('constraints')}
                className="textarea textarea-bordered h-24 font-mono text-xs"
                placeholder={'1 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.'}
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
              <h3 className="text-lg font-medium">Visible Test Cases</h3>
              <button
                type="button"
                onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                className="btn btn-primary btn-sm"
              >
                Add Visible Case
              </button>
            </div>

            {visibleFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Case {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeVisible(index)}
                    className="btn btn-ghost btn-xs text-error"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Input</span>
                    </label>
                    <textarea
                      {...register(`visibleTestCases.${index}.input`)}
                      className="textarea textarea-bordered"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Output</span>
                    </label>
                    <textarea
                      {...register(`visibleTestCases.${index}.output`)}
                      className="textarea textarea-bordered"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Explanation</span>
                  </label>
                  <textarea
                    {...register(`visibleTestCases.${index}.explanation`)}
                    className="textarea textarea-bordered"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Hidden Test Cases */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Hidden Test Cases</h3>
              <button
                type="button"
                onClick={() => appendHidden({ input: '', output: '' })}
                className="btn btn-primary btn-sm"
              >
                Add Hidden Case
              </button>
            </div>

            {hiddenFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Hidden Case {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeHidden(index)}
                    className="btn btn-ghost btn-xs text-error"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Input</span>
                    </label>
                    <textarea
                      {...register(`hiddenTestCases.${index}.input`)}
                      className="textarea textarea-bordered"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Output</span>
                    </label>
                    <textarea
                      {...register(`hiddenTestCases.${index}.output`)}
                      className="textarea textarea-bordered"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Templates */}
        <div className="card bg-base-100 shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Code Templates</h2>

          <div className="space-y-6">
            {['C++', 'Java', 'JavaScript'].map((lang, index) => (
              <div key={lang} className="border p-4 rounded-lg space-y-4">
                <h3 className="text-lg font-medium">{lang}</h3>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Initial Code</span>
                  </label>
                  <textarea
                    {...register(`startCode.${index}.initialCode`)}
                    className="textarea textarea-bordered font-mono h-32"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Reference Solution</span>
                  </label>
                  <textarea
                    {...register(`referenceSolution.${index}.completeCode`)}
                    className="textarea textarea-bordered font-mono h-48"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Create Problem
        </button>
      </form>
    </div>
  );
}

export default AdminPanel;