'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import Footer from '@/components/ui/Footer';
import { submitEvent } from '@/lib/events';
import { TIMELINE_END, TIMELINE_START } from '@/lib/eras';
import { CATEGORY_LABELS, CATEGORY_ORDER, type EventCategory } from '@/lib/types';

const LocationPicker = dynamic(() => import('@/components/submit/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-60 animate-pulse rounded-xl bg-plum-900" />,
});

interface FormState {
  title: string;
  date: string;
  locationName: string;
  category: EventCategory;
  description: string;
  submittedBy: string;
}

const EMPTY: FormState = {
  title: '',
  date: '',
  locationName: '',
  category: 'camp',
  description: '',
  submittedBy: '',
};

export default function SubmitPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  /* Object URLs are a leak if the component unmounts holding one. */
  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo.url);
    };
  }, [photo]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onPhoto = useCallback((file: File | undefined) => {
    if (!file) return;
    setPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return { file, url: URL.createObjectURL(file) };
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!coords) {
      setError('Drop a pin on the map so we know where this happened.');
      return;
    }

    const year = Number(form.date.slice(0, 4));
    if (year < TIMELINE_START || year > TIMELINE_END) {
      setError(`The timeline covers ${TIMELINE_START} to ${TIMELINE_END}.`);
      return;
    }

    setStatus('sending');
    await submitEvent({
      ...form,
      lat: coords.lat,
      lng: coords.lng,
      // A real submission uploads to Storage first and stores the download URL.
      photoUrl: photo?.url ?? '',
    });
    setStatus('sent');
  };

  const reset = () => {
    if (photo) URL.revokeObjectURL(photo.url);
    setForm(EMPTY);
    setCoords(null);
    setPhoto(null);
    setStatus('idle');
    setError(null);
  };

  return (
    <>
      <main className="relative min-h-[100dvh] overflow-hidden pt-14">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-60"
          style={{
            background:
              'radial-gradient(50% 100% at 50% 0%, rgba(126,79,198,0.26), transparent 70%)',
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-2xl px-4 py-14 sm:px-7 sm:py-20">
          <AnimatePresence mode="wait">
            {status === 'sent' ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="surface-card p-10 text-center shadow-card"
              >
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.1 }}
                  className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-plum-800 text-plum-200"
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 13 4.2 4.2L19 7.4" />
                  </svg>
                </motion.span>
                <h1 className="font-display text-3xl font-semibold tracking-[-0.01em] text-white">
                  Thank you
                </h1>
                <p className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-plum-300">
                  Your event is with the archive team. Once someone confirms the details it will
                  appear on the timeline.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                  <button type="button" onClick={reset} className="btn-primary">
                    Add another
                  </button>
                  <Link href="/timeline" className="btn-ghost">
                    Back to the timeline
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" exit={{ opacity: 0, y: -12 }}>
                <header className="mb-9">
                  <p className="font-body text-[0.7rem] uppercase tracking-[0.22em] text-plum-500">
                    Contribute
                  </p>
                  <h1 className="mt-2 font-display text-[clamp(2.2rem,5vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-white">
                    Add an event to the archive
                  </h1>
                  <p className="mt-3 max-w-xl font-body text-[0.95rem] leading-relaxed text-plum-300">
                    Every camp, hike and ceremony helps fill the gaps. Submissions are reviewed
                    before they appear on the map.
                  </p>
                </header>

                <form onSubmit={onSubmit} noValidate className="space-y-6">
                  <div>
                    <label className="label" htmlFor="title">
                      Title
                    </label>
                    <input
                      id="title"
                      required
                      className="field"
                      placeholder="Summer camp at Bhamdoun"
                      value={form.title}
                      onChange={(e) => set('title', e.target.value)}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="date">
                        Date
                      </label>
                      <input
                        id="date"
                        type="date"
                        required
                        min={`${TIMELINE_START}-01-01`}
                        max={`${TIMELINE_END}-12-31`}
                        className="field"
                        value={form.date}
                        onChange={(e) => set('date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="category">
                        Category
                      </label>
                      <select
                        id="category"
                        className="field"
                        value={form.category}
                        onChange={(e) => set('category', e.target.value as EventCategory)}
                      >
                        {CATEGORY_ORDER.map((c) => (
                          <option key={c} value={c}>
                            {CATEGORY_LABELS[c]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label" htmlFor="locationName">
                      Place name
                    </label>
                    <input
                      id="locationName"
                      required
                      className="field"
                      placeholder="Bhamdoun, Mount Lebanon"
                      value={form.locationName}
                      onChange={(e) => set('locationName', e.target.value)}
                    />
                  </div>

                  <div>
                    <span className="label">Location on the map</span>
                    <LocationPicker value={coords} onChange={setCoords} />
                  </div>

                  <div>
                    <label className="label" htmlFor="description">
                      What happened
                    </label>
                    <textarea
                      id="description"
                      required
                      rows={4}
                      className="field resize-y"
                      placeholder="Two or three sentences on what took place, who was there and anything worth remembering."
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                    />
                  </div>

                  <div>
                    <span className="label">Photograph</span>
                    <label
                      htmlFor="photo"
                      className="group flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-plum-700 bg-plum-950/40 p-4 transition-colors hover:border-plum-500/60 hover:bg-plum-900/60"
                    >
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photo.url}
                          alt="Selected photograph"
                          className="h-16 w-16 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-plum-900 text-plum-500 transition-colors group-hover:text-plum-200">
                          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="5" width="18" height="14" rx="2.5" />
                            <circle cx="8.8" cy="10.2" r="1.6" />
                            <path d="m4 17 4.8-4.4a2 2 0 0 1 2.7 0L20 19" />
                          </svg>
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block font-body text-sm font-medium text-white">
                          {photo ? photo.file.name : 'Choose a photograph'}
                        </span>
                        <span className="mt-0.5 block font-body text-xs text-plum-500">
                          {photo ? 'Click to replace' : 'JPG or PNG, scans of prints are welcome'}
                        </span>
                      </span>
                      <input
                        id="photo"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => onPhoto(e.target.files?.[0])}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="label" htmlFor="submittedBy">
                      Your name
                    </label>
                    <input
                      id="submittedBy"
                      required
                      className="field"
                      placeholder="So we can credit the contribution"
                      value={form.submittedBy}
                      onChange={(e) => set('submittedBy', e.target.value)}
                    />
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      role="alert"
                      className="rounded-xl border border-plum-500/50 bg-plum-800/60 px-3.5 py-2.5 font-body text-sm text-plum-100"
                    >
                      {error}
                    </motion.p>
                  )}

                  <div className="flex items-center gap-3 pt-1">
                    <button type="submit" disabled={status === 'sending'} className="btn-primary">
                      {status === 'sending' ? 'Sending' : 'Submit for review'}
                    </button>
                    <p className="font-body text-xs text-plum-500">
                      Nothing is published until it is checked.
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </>
  );
}
