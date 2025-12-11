import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";

type Permit = {
  id: string;
  permitId: string;
  type: string;
  priority: "critical" | "high" | "medium" | "low";
  requester: string;
  department?: string;
  submittedAt: string;
  risk: "high" | "medium" | "low";
  safetyStatus: string;
  estimatedHours?: number;
  location?: string;
  description?: string;
  reviewStatus?: "not_started" | "in_progress" | "completed" | "corrections";
};

const SAMPLE: Permit[] = [
  { id: "1", permitId: "WP-2024-0892", type: "Hot Work", priority: "high", requester: "Jane Doe", department: "Maintenance", submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), risk: "medium", safetyStatus: "Pending", estimatedHours: 3, location: "Plant A - Bay 3", description: "Welding work near fuel line", reviewStatus: "not_started" },
  { id: "2", permitId: "WP-2024-0893", type: "Electrical", priority: "critical", requester: "Carlos M", department: "Engineering", submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), risk: "high", safetyStatus: "Pending", estimatedHours: 2, location: "Substation 2", description: "High-voltage panel maintenance", reviewStatus: "in_progress" },
  { id: "3", permitId: "WP-2024-0894", type: "Confined Space", priority: "medium", requester: "Lee H", department: "Operations", submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), risk: "high", safetyStatus: "Approved", estimatedHours: 4, location: "Tank 7", description: "Inspection and cleaning", reviewStatus: "completed" },
];

export default function ApproverReview() {
  const [permits, setPermits] = useState<Permit[]>(SAMPLE);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(SAMPLE[0].id);
  const [activeTab, setActiveTab] = useState<number>(0);

  const selected = permits.find((p) => p.id === selectedId) || null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return permits;
    return permits.filter((p) => [p.permitId, p.requester, p.type, p.location, p.description].join(" ").toLowerCase().includes(q));
  }, [permits, query]);

  function startReview(id: string) {
    setSelectedId(id);
    setPermits((s) => s.map((p) => (p.id === id ? { ...p, reviewStatus: "in_progress" } : p)));
  }

  function markComplete(id: string) {
    setPermits((s) => s.map((p) => (p.id === id ? { ...p, reviewStatus: "completed" } : p)));
  }

  return (
    <div className="pb-6 space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[35%_1fr]">
        <aside>
          <Card>
            <CardHeader>
              <CardTitle>Permits</CardTitle>
              <CardDescription>Filter and select a permit to review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <Input placeholder="Search permits by ID, requester, or status..." value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-auto">
                {filtered.map((p) => (
                  <div key={p.id} className={`rounded-md border p-3 cursor-pointer ${p.id === selectedId ? 'ring-2 ring-offset-2' : 'hover:bg-muted'}`} onClick={() => setSelectedId(p.id)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{p.permitId} <span className="text-xs text-muted-foreground">• {p.type}</span></div>
                        <div className="text-sm text-muted-foreground truncate" style={{ maxWidth: 220 }}>{p.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs rounded-full bg-muted px-2 py-1 text-muted-foreground">{p.reviewStatus === 'in_progress' ? 'In Progress' : p.reviewStatus === 'completed' ? 'Completed' : p.reviewStatus === 'corrections' ? 'Corrections' : 'Not started'}</div>
                        <div className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(p.submittedAt), { addSuffix: true })}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {p.reviewStatus !== 'in_progress' ? (
                        <Button size="sm" onClick={(e)=>{ e.stopPropagation(); startReview(p.id); }}>Start Review</Button>
                      ) : (
                        <Button size="sm" onClick={(e)=>{ e.stopPropagation(); markComplete(p.id); }}>Mark Complete</Button>
                      )}
                      <Button size="sm" variant="outline" onClick={(e)=>{ e.stopPropagation(); setSelectedId(p.id); }}>Continue</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        <main>
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Permit</div>
                <div className="text-xl font-semibold">{selected?.permitId || 'Select a permit'}</div>
                <div className="text-sm text-muted-foreground">{selected?.type} • {selected?.priority}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => alert('Approve (placeholder)')} className="bg-green-600 text-white">Approve</Button>
                <Button variant="outline" onClick={() => alert('Conditional approval (placeholder)')}>Conditional</Button>
                <Button variant="destructive" onClick={() => alert('Reject (placeholder)')}>Reject</Button>
                <Button variant="ghost">Escalate</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex gap-1 border rounded-lg p-1">
                  <button className={`px-3 py-1 rounded ${activeTab===0 ? 'bg-muted' : ''}`} onClick={() => setActiveTab(0)}>Work Info</button>
                  <button className={`px-3 py-1 rounded ${activeTab===1 ? 'bg-muted' : ''}`} onClick={() => setActiveTab(1)}>Risk Assessment</button>
                  <button className={`px-3 py-1 rounded ${activeTab===2 ? 'bg-muted' : ''}`} onClick={() => setActiveTab(2)}>Compliance</button>
                  <button className={`px-3 py-1 rounded ${activeTab===3 ? 'bg-muted' : ''}`} onClick={() => setActiveTab(3)}>Documents</button>
                  <button className={`px-3 py-1 rounded ${activeTab===4 ? 'bg-muted' : ''}`} onClick={() => setActiveTab(4)}>Review History</button>
                </div>
              </div>

              <div className="space-y-4">
                {activeTab === 0 && (
                  <div>
                    <h3 className="text-sm font-medium">Work Description</h3>
                    <div className="text-sm text-muted-foreground">{selected?.description}</div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div>
                        <div className="text-sm font-medium">Location</div>
                        <div className="text-sm">{selected?.location}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Estimated Duration</div>
                        <div className="text-sm">{selected?.estimatedHours} hrs</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-medium">Personnel</div>
                      <div className="text-sm text-muted-foreground">{selected?.requester} • {selected?.department}</div>
                    </div>
                  </div>
                )}

                {activeTab === 1 && (
                  <div>
                    <h3 className="text-sm font-medium">Risk Matrix</h3>
                    <div className="text-sm text-muted-foreground">Probability vs Impact chart (placeholder)</div>
                  </div>
                )}

                {activeTab === 2 && (
                  <div>
                    <h3 className="text-sm font-medium">Regulatory Compliance</h3>
                    <div className="text-sm text-muted-foreground">Compliance checks and required permits (placeholder)</div>
                  </div>
                )}

                {activeTab === 3 && (
                  <div>
                    <h3 className="text-sm font-medium">Supporting Documents</h3>
                    <div className="text-sm text-muted-foreground">Attached files and previews (placeholder)</div>
                  </div>
                )}

                {activeTab === 4 && (
                  <div>
                    <h3 className="text-sm font-medium">Review History</h3>
                    <div className="text-sm text-muted-foreground">Previous reviews and comments (placeholder)</div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium">Reviewer Notes</h4>
                  <textarea className="w-full rounded-md border p-2" rows={4} placeholder="Add notes for the review, observations, and decision rationale..." />
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={() => alert('Save Note (placeholder)')}>Save Note</Button>
                  <Button variant="outline">Attach File</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
