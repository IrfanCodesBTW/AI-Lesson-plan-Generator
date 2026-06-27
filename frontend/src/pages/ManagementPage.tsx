import { useEffect, useState } from 'react';
import {
  fetchParents,
  createParent,
  fetchChildren,
  createChild,
  fetchClassrooms,
  createClassroom,
} from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { CommunicationModal } from '../components/CommunicationModal';
import { MessageSquare } from 'lucide-react';

export function ManagementPage() {
  const [activeTab, setActiveTab] = useState<'parents' | 'children' | 'classrooms'>('parents');

  // Parents
  const [parents, setParents] = useState<any[]>([]);
  const [parentName, setParentName] = useState('');

  // Children
  const [children, setChildren] = useState<any[]>([]);
  const [childName, setChildName] = useState('');
  const [childDob, setChildDob] = useState('');
  const [childParentId, setChildParentId] = useState('');

  // Classrooms
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [classroomName, setClassroomName] = useState('');
  const [classroomCap, setClassroomCap] = useState(20);

  // Communication Modal State
  const [messagingParent, setMessagingParent] = useState<{ id: string; name: string } | null>(null);

  const loadData = async () => {
    const [p, c, cl] = await Promise.all([
      fetchParents().catch(() => []),
      fetchChildren().catch(() => []),
      fetchClassrooms().catch(() => []),
    ]);
    setParents(p);
    setChildren(c);
    setClassrooms(cl);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createParent({ name: parentName });
    setParentName('');
    loadData();
  };

  const handleChildSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createChild({ name: childName, dob: childDob, parent_id: childParentId });
    setChildName('');
    setChildDob('');
    setChildParentId('');
    loadData();
  };

  const handleClassroomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createClassroom({ name: classroomName, capacity: classroomCap });
    setClassroomName('');
    loadData();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader title="Centre Management" subtitle="Manage parents, children, and classrooms" />

      <div className="flex gap-4 border-b-2 border-black pb-2">
        {(['parents', 'children', 'classrooms'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-black rounded-xl capitalize ${activeTab === tab ? 'bg-black text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'parents' && (
        <div className="space-y-6">
          <form
            onSubmit={handleParentSubmit}
            className="flex gap-4 p-4 border-2 border-black rounded-xl bg-white dark:bg-gray-900"
          >
            <input
              required
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Parent Name"
              className="flex-1 p-2 border-2 border-black rounded-lg"
            />
            <button className="px-6 py-2 bg-[#8d6be8] text-white font-bold rounded-lg border-2 border-black hover:bg-[#734bd3]">
              Add Parent
            </button>
          </form>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parents.map((p) => (
              <div
                key={p.id}
                className="p-4 border-2 border-black rounded-xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-lg">{p.name}</p>
                    <p className="text-sm text-gray-500">
                      {p.email || 'No email'} | {p.phone || 'No phone'}
                    </p>
                  </div>
                  <button
                    onClick={() => setMessagingParent({ id: p.id, name: p.name })}
                    className="p-2 bg-[#8d6be8] text-white rounded-lg border-2 border-black hover:bg-[#734bd3]"
                    title="Message Parent"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'children' && (
        <div className="space-y-6">
          <form
            onSubmit={handleChildSubmit}
            className="flex gap-4 p-4 border-2 border-black rounded-xl bg-white dark:bg-gray-900 flex-wrap"
          >
            <input
              required
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Child Name"
              className="flex-1 p-2 border-2 border-black rounded-lg"
            />
            <input
              required
              type="date"
              value={childDob}
              onChange={(e) => setChildDob(e.target.value)}
              className="p-2 border-2 border-black rounded-lg"
            />
            <select
              required
              value={childParentId}
              onChange={(e) => setChildParentId(e.target.value)}
              className="p-2 border-2 border-black rounded-lg"
            >
              <option value="">Select Parent</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <button className="px-6 py-2 bg-[#8d6be8] text-white font-bold rounded-lg border-2 border-black hover:bg-[#734bd3]">
              Add Child
            </button>
          </form>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((c) => (
              <div
                key={c.id}
                className="p-4 border-2 border-black rounded-xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <p className="font-black text-lg">{c.name}</p>
                <p className="text-sm">DOB: {new Date(c.dob).toLocaleDateString()}</p>
                <p className="text-sm font-bold text-[#8d6be8]">Parent: {c.parent_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'classrooms' && (
        <div className="space-y-6">
          <form
            onSubmit={handleClassroomSubmit}
            className="flex gap-4 p-4 border-2 border-black rounded-xl bg-white dark:bg-gray-900"
          >
            <input
              required
              value={classroomName}
              onChange={(e) => setClassroomName(e.target.value)}
              placeholder="Classroom Name"
              className="flex-1 p-2 border-2 border-black rounded-lg"
            />
            <input
              required
              type="number"
              value={classroomCap}
              onChange={(e) => setClassroomCap(Number(e.target.value))}
              placeholder="Capacity"
              className="w-32 p-2 border-2 border-black rounded-lg"
            />
            <button className="px-6 py-2 bg-[#8d6be8] text-white font-bold rounded-lg border-2 border-black hover:bg-[#734bd3]">
              Add Classroom
            </button>
          </form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classrooms.map((c) => (
              <div
                key={c.id}
                className="p-4 border-2 border-black rounded-xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center"
              >
                <p className="font-black text-lg">{c.name}</p>
                <span className="px-3 py-1 bg-gray-200 rounded-full text-sm font-bold">
                  Cap: {c.capacity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {messagingParent && (
        <CommunicationModal
          parentId={messagingParent.id}
          parentName={messagingParent.name}
          onClose={() => setMessagingParent(null)}
        />
      )}
    </div>
  );
}
