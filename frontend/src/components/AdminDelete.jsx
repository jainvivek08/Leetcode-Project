import { useEffect, useState } from 'react';
import axiosClient, { getApiErrorMessage } from '../utils/axiosClient';
import { normalizeTags, tagLabel } from '../utils/tags';

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/all-lite');
      setProblems(Array.isArray(data) ? data : (data?.problems || []));
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const titleMatch = (p.title || '').toLowerCase().includes(q);
    const numMatch = String(p.problemNumber || '').includes(q);
    return titleMatch || numMatch;
  });

  const handleDelete = async (id) => {
    const confirmationText = 'This will also delete all submissions, the solution video and solved-progress entries for this problem. This cannot be undone.';
    if (!window.confirm(confirmationText)) return;
    
    try {
      setError(null);
      const res = await axiosClient.delete(`/problem/delete/${id}`);
      const deletedInfo = res.data?.deleted;
      if (deletedInfo) {
        setSuccessMsg(`Problem deleted successfully! Removed ${deletedInfo.submissions} submission(s), ${deletedInfo.videos} video(s), and ${deletedInfo.userSolvedRefs} solved-progress reference(s).`);
      } else {
        setSuccessMsg('Problem deleted successfully.');
      }
      await fetchProblems();
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Failed to delete problem');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Delete Problems</h1>
          <p className="text-sm text-base-content/70">
            Permanently remove problems and associated submissions/videos.
          </p>
        </div>
        <input
          type="text"
          placeholder="Search by title or #..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered w-full sm:w-72 text-sm"
        />
      </div>

      {successMsg && (
        <div className="alert alert-success shadow-lg my-4 flex items-center justify-between">
          <span>{successMsg}</span>
          <button className="btn btn-xs btn-ghost" onClick={() => setSuccessMsg(null)}>✕</button>
        </div>
      )}

      {error && (
        <div className="alert alert-error shadow-lg my-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
          <button className="btn btn-xs btn-ghost" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th className="w-1/12">#</th>
              <th className="w-4/12">Title</th>
              <th className="w-2/12">Difficulty</th>
              <th className="w-3/12">Tags</th>
              <th className="w-2/12">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-base-content/60">
                  {searchQuery ? 'No problems matching your search.' : 'No problems found.'}
                </td>
              </tr>
            ) : (
              filteredProblems.map((problem, index) => (
                <tr key={problem._id}>
                  <th>{problem.problemNumber != null ? `#${problem.problemNumber}` : index + 1}</th>
                  <td>{problem.title}</td>
                <td>
                  <span className={`badge ${
                    problem.difficulty?.toLowerCase() === 'easy' 
                      ? 'badge-success' 
                      : problem.difficulty?.toLowerCase() === 'medium' 
                        ? 'badge-warning' 
                        : 'badge-error'
                  }`}>
                    {problem.difficulty}
                  </span>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {normalizeTags(problem.tags).map((t) => (
                      <span key={t} className="badge badge-outline badge-xs">
                        {tagLabel(t)}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleDelete(problem._id)}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDelete;