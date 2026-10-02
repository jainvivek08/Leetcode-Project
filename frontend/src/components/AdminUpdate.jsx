import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Video, Edit, Search } from 'lucide-react';
import axiosClient, { getApiErrorMessage } from '../utils/axiosClient';
import { normalizeTags, tagLabel } from '../utils/tags';

function AdminUpdate() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAdminList();
  }, []);

  const fetchAdminList = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosClient.get('/problem/adminList');
      setProblems(data || []);
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Failed to fetch problem list');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const titleMatch = (p.title || '').toLowerCase().includes(q);
    const slugMatch = (p.slug || '').toLowerCase().includes(q);
    const numMatch = String(p.problemNumber || '').includes(q);
    return titleMatch || slugMatch || numMatch;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Update Problems</h1>
          <p className="text-sm text-base-content/70">
            Select an existing problem to edit its details, test cases, or starter code.
          </p>
        </div>
        <Link to="/admin" className="btn btn-sm btn-ghost">
          &larr; Admin Dashboard
        </Link>
      </div>

      {error && (
        <div className="alert alert-error shadow-lg mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button className="btn btn-xs btn-ghost" onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Search and Counts Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-base-content/50" />
          <input
            type="text"
            placeholder="Search problems by title, slug, or #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full pl-9 text-sm"
          />
        </div>
        <div className="text-xs text-base-content/70">
          Showing {filteredProblems.length} of {problems.length} problem(s)
        </div>
      </div>

      {/* Problems Table */}
      <div className="overflow-x-auto bg-base-100 rounded-xl shadow-lg border border-base-300">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th className="w-16">#</th>
              <th>Title</th>
              <th className="w-28">Difficulty</th>
              <th>Tags</th>
              <th className="w-32">Test Cases</th>
              <th className="w-24">Video</th>
              <th className="w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-base-content/60">
                  {searchQuery ? 'No problems matching your search.' : 'No problems found.'}
                </td>
              </tr>
            ) : (
              filteredProblems.map((problem) => (
                <tr key={problem._id}>
                  <td className="font-mono font-semibold">
                    {problem.problemNumber != null ? `#${problem.problemNumber}` : '-'}
                  </td>
                  <td>
                    <div className="font-bold text-sm">{problem.title}</div>
                    <div className="text-xs font-mono text-base-content/60">
                      {problem.slug}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge badge-sm font-semibold capitalize ${
                        problem.difficulty?.toLowerCase() === 'easy'
                          ? 'badge-success text-success-content'
                          : problem.difficulty?.toLowerCase() === 'medium'
                            ? 'badge-warning text-warning-content'
                            : 'badge-error text-error-content'
                      }`}
                    >
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
                  <td className="text-xs">
                    <span className="font-semibold text-primary">
                      {problem.visibleCount}
                    </span>{' '}
                    vis /{' '}
                    <span className="font-semibold text-secondary">
                      {problem.hiddenCount}
                    </span>{' '}
                    hid
                  </td>
                  <td>
                    {problem.hasVideo ? (
                      <span className="badge badge-success badge-xs gap-1 py-2">
                        <Video size={10} /> Yes
                      </span>
                    ) : (
                      <span className="badge badge-ghost badge-xs text-base-content/50">
                        No
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    <Link
                      to={`/admin/update/${problem._id}`}
                      className="btn btn-sm btn-warning gap-1"
                    >
                      <Edit size={14} /> Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUpdate;
