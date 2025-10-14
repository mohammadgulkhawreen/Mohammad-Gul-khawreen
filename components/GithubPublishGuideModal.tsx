import React from 'react';

interface GithubPublishGuideModalProps {
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


const GithubPublishGuideModal: React.FC<GithubPublishGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 z-[100] flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="github-publish-guide-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl transform transition-all duration-300 ease-out animate-fade-in-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-200 dark:border-slate-700">
          <h2 id="github-publish-guide-title" className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-3">
            <i className="fa-brands fa-github"></i>
            په GitHub کې د ویب سایټ خپرولو لارښود
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        <div className="space-y-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                 <p className="text-center text-slate-700 dark:text-slate-200">
                    ستاسو ویب سایټ داسې جوړ شوی چې پیچلې "build" پروسې ته اړتیا نلري. تاسو کولی شئ خپل ټول فایلونه مستقیم په GitHub کې اپلوډ کړئ او د <strong>GitHub Pages</strong> په کارولو سره یې وړیا آنلاین کړئ.
                 </p>
            </div>

            <GuideStep icon="fa-user-plus" title="۱ ګام: GitHub اکاونټ او Repository جوړول">
                که تاسو اکاونټ نلرئ، په <a href="https://github.com/join" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">github.com</a> کې یو جوړ کړئ. بیا، یو نوی repository جوړ کړئ. تاسو کولی شئ هر نوم چې وغواړئ ورته ورکړئ.
            </GuideStep>

            <GuideStep icon="fa-key" title="۲ ګام: د API کیلي اضافه کول (مهم)">
                مخکې له دې چې خپل فایلونه اپلوډ کړئ، <strong>index.html</strong> فایل په یو متن ایډیټر کې خلاص کړئ. د <code>&lt;/head&gt;</code> کرښې څخه سم مخکې، لاندې کوډ اضافه کړئ او <code>YOUR_API_KEY_HERE</code> په خپل اصلي کیلي بدل کړئ:
                <pre className="mt-2 bg-slate-800 dark:bg-black/50 text-white dark:text-slate-200 p-3 rounded-md text-xs whitespace-pre-wrap">
                    <code>
        {`<script>
          window.process = { env: { API_KEY: "YOUR_API_KEY_HERE" } };
        <\/script>`}
                    </code>
                </pre>
                دا کار به ستاسو په آنلاین سایټ کې د AI ځانګړتیاوې فعالې کړي. فایل خوندي کړئ.
            </GuideStep>

            <GuideStep icon="fa-upload" title="۳ ګام: خپل فایلونه اپلوډ کړئ">
                په خپل نوي repository کې، د <strong>"Add file"</strong> تڼۍ باندې کلیک وکړئ او بیا <strong>"Upload files"</strong> انتخاب کړئ. د خپلې پروژې ټول فایلونه او فولډرونه (لکه <code>index.html</code>, <code>components</code> فولډر، او نور) دلته راکش کړئ یا یې انتخاب کړئ.
            </GuideStep>

             <GuideStep icon="fa-cog" title="۴ ګام: د Repository تنظیماتو ته لاړ شئ">
                کله چې فایلونه اپلوډ شول، د خپل repository په پورتنۍ برخه کې د <strong>"Settings"</strong> ټب باندې کلیک وکړئ.
             </GuideStep>

             <GuideStep icon="fa-file-lines" title="۵ ګام: د Pages برخې ته لاړ شئ">
                په کیڼ اړخ مینو کې، د <strong>"Pages"</strong> انتخاب باندې کلیک وکړئ.
             </GuideStep>

             <GuideStep icon="fa-code-branch" title="۶ ګام: سرچینه وټاکئ">
                د "Build and deployment" لاندې، د "Source" لپاره <strong>"Deploy from a branch"</strong> انتخاب کړئ. بیا، د "Branch" لاندې، خپل اصلي برانچ (معمولا <code>main</code> یا <code>master</code>) انتخاب کړئ او فولډر پر <code>/(root)</code> پریږدئ. بیا <strong>Save</strong> کلیک وکړئ.
             </GuideStep>

             <GuideStep icon="fa-check-circle" title="۷ ګام: ستاسو سایټ آنلاین دی!">
                یو څو دقیقې وروسته، GitHub به ستاسو سایټ آنلاین کړي. تاسو کولی شئ خپل سایټ ته لینک د همدې پاڼې په پورتنۍ برخه کې ومومئ. مبارک شه!
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

export default GithubPublishGuideModal;