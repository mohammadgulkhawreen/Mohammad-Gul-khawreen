import React from 'react';

interface PublishGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuideStep: React.FC<{ icon: string; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
            <i className={`fas ${icon} text-xl text-indigo-600 dark:text-indigo-400`}></i>
        </div>
        <div>
            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{title}</h4>
            <p className="text-slate-600 dark:text-slate-300">{children}</p>
        </div>
    </div>
);


const PublishGuideModal: React.FC<PublishGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 z-[100] flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-guide-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl transform transition-all duration-300 ease-out animate-fade-in-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-200 dark:border-slate-700">
          <h2 id="publish-guide-title" className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-3">
            <i className="fas fa-rocket"></i>
            ستاسو د ویب سایټ آنلاین کولو لارښود
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        <div className="space-y-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                 <p className="text-center text-slate-700 dark:text-slate-200">
                    ستاسو ویب سایټ یو عصري جوړښت کاروي چې د "جوړولو" یا "build" پیچلې پروسې ته اړتیا نلري. دا پدې مانا ده چې تاسو کولی شئ خپل ټول فایلونه لکه څنګه چې دي، مستقیم آنلاین کړئ!
                    <br />
                    ترټولو اسانه او وړیا لاره د <strong className="text-indigo-600 dark:text-indigo-400">Netlify Drop</strong> کارول دي.
                 </p>
            </div>

            <GuideStep icon="fa-folder" title="۱ ګام: خپل فایلونه چمتو کړئ">
                ډاډ ترلاسه کړئ چې ستاسو د پروژې ټول فایلونه او فولډرونه په یو ځای کې دي. پدې کې دا فایلونه شامل دي: <code>index.html</code>, <code>index.tsx</code>, <code>App.tsx</code>, <code>styles.css</code>, <code>components</code> فولډر، او نور ټول اړوند فایلونه.
            </GuideStep>

            <GuideStep icon="fa-globe" title="۲ ګام: Netlify Drop ته لاړ شئ">
                خپل ویب براوزر خلاص کړئ او دې پته ته لاړ شئ:
                <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-2">
                    app.netlify.com/drop
                </a>
            </GuideStep>

             <GuideStep icon="fa-hand-pointer" title="۳ ګام: خپل فولډر راکش کړئ">
                د خپل کمپیوټر څخه هغه فولډر چې ستاسو ټول فایلونه پکې دي، د Netlify پاڼې ته راکش کړئ (drag and drop). Netlify به ستاسو سایټ آنلاین کړي او تاسو ته به یو لنډمهاله لینک درکړي.
             </GuideStep>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/40 border-l-4 border-amber-400 dark:border-amber-500">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <i className="fas fa-exclamation-triangle text-amber-500 dark:text-amber-400 text-xl"></i>
                    </div>
                    <div className="ml-3">
                        <h4 className="font-bold text-lg text-amber-800 dark:text-amber-200">مهم: د AI ځانګړتیاوو فعالول</h4>
                        <div className="mt-2 text-sm text-amber-700 dark:text-amber-300 space-y-2">
                            <p>د دې لپاره چې د AI ځانګړتیاوې (لکه چټ بوټ او د کتاب خلاصه) آنلاین کار وکړي، تاسو باید خپله د Google AI API کیلي اضافه کړئ:</p>
                            <ol className="list-decimal list-inside pl-2 space-y-1">
                                <li>په Netlify کې د خپل سایټ ترتیباتو (Site settings) ته لاړ شئ.</li>
                                <li>کیڼ اړخ کې، <strong>Build & deploy</strong> → <strong>Post processing</strong> ته لاړ شئ.</li>
                                <li>د <strong>Snippet injection</strong> برخې کې، <strong>Add snippet</strong> کلیک وکړئ.</li>
                                <li>دا کوډ په بکس کې کاپي کړئ، او <code>YOUR_API_KEY_HERE</code> په خپل اصلي کیلي بدل کړئ:</li>
                            </ol>
                            <pre className="bg-slate-800 dark:bg-black/50 text-white dark:text-slate-200 p-3 rounded-md text-xs whitespace-pre-wrap">
                                <code>
    {`<script>
      window.process = { env: { API_KEY: "YOUR_API_KEY_HERE" } };
    <\/script>`}
                                </code>
                            </pre>
                            <p>د <strong>Insert before `&lt;/head&gt;`</strong> انتخاب کړئ او <strong>Save</strong> کلیک وکړئ.</p>
                        </div>
                    </div>
                </div>
            </div>

             <GuideStep icon="fa-check-circle" title="۴ ګام: همدا وه ټوله کیسه!">
                مبارک شه، ستاسو ویب سایټ اوس آنلاین دی او د AI ځانګړتیاوې یې فعالې دي! تاسو کولی شئ د خپل سایټ لینک له نورو سره شریک کړئ.
             </GuideStep>
        </div>

        <div className="mt-8 border-t pt-4 border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-500 transition-all duration-300"
          >
            پوه شوم
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishGuideModal;