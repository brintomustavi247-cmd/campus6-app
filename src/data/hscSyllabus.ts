// ============================================================================
// CAMPUS 6.0 — HSC ADMISSION FULL SYLLABUS (SCIENCE)
// ============================================================================
// Source of truth for the Focus Timer's Subject → Chapter → Topic picker.
// Also exposes a per-user preference (picker vs. free-text mode) persisted
// in localStorage, so the toggle survives refreshes.
// ============================================================================

export interface SyllabusTopic {
  en: string;
  bn: string;
}

export interface SyllabusChapter {
  chapter_no: number;
  title_en: string;
  title_bn: string;
  topics: SyllabusTopic[];
}

export interface SyllabusPaper {
  paper: number;
  name_en: string;
  name_bn: string;
  chapters: SyllabusChapter[];
}

export interface SyllabusSubject {
  id: string;
  name_en: string;
  name_bn: string;
  papers: SyllabusPaper[];
}

export interface HscSyllabus {
  curriculum: string;
  subjects: SyllabusSubject[];
}

// ----------------------------------------------------------------------------
// THE SYLLABUS DATA
// ----------------------------------------------------------------------------

export const HSC_SYLLABUS: HscSyllabus = {
  curriculum: 'HSC Academic Full Syllabus (Science)',
  subjects: [
    {
      id: 'physics',
      name_en: 'Physics',
      name_bn: 'পদার্থবিজ্ঞান',
      papers: [
        {
          paper: 1,
          name_en: 'Physics 1st Paper',
          name_bn: 'পদার্থবিজ্ঞান ১ম পত্র',
          chapters: [
            { chapter_no: 1, title_en: 'Physical World and Measurement', title_bn: 'ভৌতজগৎ ও পরিমাপ', topics: [
              { en: 'Physical quantities and units', bn: 'ভৌত রাশি ও একক' },
              { en: 'Dimensions and dimensional analysis', bn: 'মাত্রা ও মাত্রা সমীকরণ' },
              { en: 'Errors in measurement (Absolute, Relative, Percentage)', bn: 'পরিমাপের ত্রুটি (পরম, আপেক্ষিক, শতকরা)' },
              { en: 'Vernier caliper and screw gauge', bn: 'ভার্নিয়ার স্কেল ও স্ক্রু গজ' },
            ]},
            { chapter_no: 2, title_en: 'Vectors', title_bn: 'ভেক্টর', topics: [
              { en: 'Vector representation and types', bn: 'ভেক্টরের প্রকাশ ও প্রকারভেদ' },
              { en: 'Vector addition and resolution', bn: 'ভেক্টর যোজন ও বিভাজন' },
              { en: 'Dot product and Cross product', bn: 'স্কেলার গুণন ও ভেক্টর গুণন' },
              { en: 'River and boat problems', bn: 'নদী ও নৌকার গতি সংক্রান্ত সমস্যা' },
              { en: 'Gradient, Divergence, and Curl', bn: 'গ্র্যাডিয়েন্ট, ডাইভারজেন্স ও কার্ল' },
            ]},
            { chapter_no: 3, title_en: 'Dynamics', title_bn: 'গতিবিদ্যা', topics: [
              { en: 'Equations of rectilinear motion', bn: 'সরলরৈখিক গতির সমীকরণ' },
              { en: 'Projectile motion (Trajectories, Range, Max height)', bn: 'প্রাস বা প্রক্ষেপক (গতিপথ, পাল্লা, সর্বোচ্চ উচ্চতা)' },
              { en: 'Relative velocity', bn: 'আপেক্ষিক বেগ' },
              { en: 'Graphical analysis of motion', bn: 'গতির লেখচিত্র বিশ্লেষণ' },
            ]},
            { chapter_no: 4, title_en: 'Newtonian Mechanics', title_bn: 'নিউটনিয়ান বলবিদ্যা', topics: [
              { en: "Newton's laws of motion and momentum conservation", bn: 'গতির সূত্র ও ভরবেগ সংরক্ষণ সূত্র' },
              { en: 'Impulse and impulsive force', bn: 'বলের ঘাত ও ঘাত বল' },
              { en: 'Torque and angular momentum', bn: 'টর্ক ও কৌণিক ভরবেগ' },
              { en: 'Moment of inertia and radius of gyration', bn: 'জড়তার ভ্রামক ও চক্রগতির ব্যাসার্ধ' },
              { en: 'Centripetal force and road banking', bn: 'কেন্দ্রমুখী বল ও রাস্তার ব্যাংকিং' },
              { en: 'Frictional force', bn: 'ঘর্ষণ বল' },
            ]},
            { chapter_no: 5, title_en: 'Work, Energy, and Power', title_bn: 'কাজ, শক্তি ও ক্ষমতা', topics: [
              { en: 'Work done by constant and variable forces', bn: 'ধ্রুব ও পরিবর্তনশীল বল দ্বারা কৃতকাজ' },
              { en: 'Work-Energy theorem', bn: 'কাজ-শক্তি উপপাদ্য' },
              { en: 'Conservation of mechanical energy', bn: 'যান্ত্রিক শক্তি সংরক্ষণশীলতা' },
              { en: 'Spring potential energy', bn: 'স্প্রিং-এর বিভব শক্তি' },
              { en: 'Emptying a water well/tank calculation', bn: 'কুয়া/চৌবাচ্চা খালি করার কাজ' },
              { en: 'Power and efficiency', bn: 'ক্ষমতা ও কর্মদক্ষতা' },
            ]},
            { chapter_no: 6, title_en: 'Gravitation and Gravity', title_bn: 'মহাকর্ষ ও অভিকর্ষ', topics: [
              { en: "Newton's law of gravitation and Kepler's laws", bn: 'মহাকর্ষ সূত্র ও কেপলারের সূত্রসমূহ' },
              { en: 'Variation of gravitational acceleration (Altitude, Depth, Latitude)', bn: 'উচ্চতা, গভীরতা ও অক্ষাংশের সাথে g এর পরিবর্তন' },
              { en: 'Gravitational field and potential', bn: 'মহাকর্ষীয় প্রাবল্য ও বিভব' },
              { en: 'Escape velocity', bn: 'মুক্তিবেগ' },
              { en: 'Orbital velocity and geostationary satellites', bn: 'কক্ষীয় বেগ ও ভূ-স্থির উপগ্রহ' },
            ]},
            { chapter_no: 7, title_en: 'Structural Properties of Matter', title_bn: 'পদার্থের গাঠনিক ধর্ম', topics: [
              { en: "Stress, Strain, and Hooke's law", bn: 'পীড়ন, বিকৃতি ও হুকের সূত্র' },
              { en: "Elastic moduli (Young's, Bulk, Rigidity)", bn: 'স্থিতিস্থাপক গুণাঙ্ক (ইয়ং, আয়তন, দৃঢ়তা)' },
              { en: "Poisson's ratio and elastic energy", bn: 'পয়সনের অনুপাত ও স্থিতিস্থাপক শক্তি' },
              { en: 'Surface tension and surface energy', bn: 'পৃষ্ঠটান ও পৃষ্ঠশক্তি' },
              { en: "Viscosity, Stoke's law, and terminal velocity", bn: 'সান্দ্রতা, স্টোকসের সূত্র ও প্রান্তিক বেগ' },
            ]},
            { chapter_no: 8, title_en: 'Periodic Motion', title_bn: 'পর্যায়বৃত্ত গতি', topics: [
              { en: 'Characteristics of periodic and oscillatory motion', bn: 'পর্যায়বৃত্ত ও স্পন্দন গতির বৈশিষ্ট্য' },
              { en: 'Simple harmonic motion (SHM) equations', bn: 'সরল ছন্দিত স্পন্দনের অন্তরক সমীকরণ ও সমাধান' },
              { en: 'Energy of simple harmonic oscillator', bn: 'সরল ছন্দিত কণার শক্তি' },
              { en: 'Simple pendulum and spring-mass system', bn: 'সরল দোলক ও স্প্রিং-ভর সিস্টেম' },
              { en: 'Second pendulum', bn: 'সেকেন্ড দোলক' },
            ]},
            { chapter_no: 9, title_en: 'Waves', title_bn: 'তরঙ্গ', topics: [
              { en: 'Transverse and longitudinal waves', bn: 'অনুদৈর্ঘ্য ও অনুপ্রস্থ তরঙ্গ' },
              { en: 'Progressive wave equation', bn: 'অগ্রগামী তরঙ্গের সমীকরণ' },
              { en: 'Stationary/Standing waves', bn: 'স্থির তরঙ্গ ও নিস্পন্দ বিন্দু' },
              { en: 'Sound intensity, intensity level, and decibels', bn: 'শব্দের তীব্রতা, তীব্রতা লেভেল ও ডেসিবেল' },
              { en: 'Beats and frequency determination', bn: 'বীট ও কম্পাঙ্ক নির্ণয়' },
              { en: 'Doppler effect', bn: 'ডপলার ক্রিয়া' },
            ]},
            { chapter_no: 10, title_en: 'Ideal Gas and Kinetic Theory', title_bn: 'আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব', topics: [
              { en: "Boyle's, Charles's, and Avogadro's laws", bn: 'বয়েল, চার্লস ও অ্যাভোগাড্রোর সূত্র' },
              { en: 'Ideal gas equation (PV = nRT)', bn: 'আদর্শ গ্যাসের অবস্থা সমীকরণ' },
              { en: 'Root mean square velocity (RMS)', bn: 'মূল গড় বর্গ বেগ' },
              { en: 'Degrees of freedom and equipartition of energy', bn: 'স্বাধীনতার মাত্রা ও শক্তির সমবিভাজন' },
              { en: 'Relative humidity and dew point', bn: 'আপেক্ষিক আর্দ্রতা ও শিশিরাংক' },
            ]},
          ],
        },
        {
          paper: 2,
          name_en: 'Physics 2nd Paper',
          name_bn: 'পদার্থবিজ্ঞান ২য় পত্র',
          chapters: [
            { chapter_no: 1, title_en: 'Thermodynamics', title_bn: 'তাপগতিবিদ্যা', topics: [
              { en: 'Zeroth law and temperature measurement', bn: 'তাপগতিবিদ্যার শূন্যতম সূত্র ও থার্মোমিটার' },
              { en: 'First law of thermodynamics (Internal energy, Work)', bn: 'প্রথম সূত্র (অভ্যন্তরীণ শক্তি, কৃতকাজ)' },
              { en: 'Isothermal and adiabatic processes', bn: 'সমোষ্ণ ও রুদ্ধতাপীয় প্রক্রিয়া' },
              { en: 'Carnot cycle and engine efficiency', bn: 'কার্নো চক্র ও ইঞ্জিনের দক্ষতা' },
              { en: 'Second law of thermodynamics and Entropy', bn: 'দ্বিতীয় সূত্র ও এন্ট্রপি' },
            ]},
            { chapter_no: 2, title_en: 'Static Electricity', title_bn: 'স্থির তড়িৎ', topics: [
              { en: "Coulomb's law and permittivity", bn: 'কুলম্বের সূত্র ও মাধ্যমের ভেদনযোগ্যতা' },
              { en: 'Electric field and intensity', bn: 'তড়িৎ ক্ষেত্র ও তড়িৎ প্রাবল্য' },
              { en: 'Electric potential and potential difference', bn: 'তড়িৎ বিভব ও বিভব পার্থক্য' },
              { en: 'Electric dipole', bn: 'তড়িৎ দ্বিমেরু' },
              { en: 'Capacitor, capacitance, and dielectrics', bn: 'ধারক, ধারকত্ব ও ডাই-ইলেকট্রিক' },
              { en: 'Energy stored in a capacitor', bn: 'ধারকে সঞ্চিত শক্তি' },
            ]},
            { chapter_no: 3, title_en: 'Current Electricity', title_bn: 'চল তড়িৎ', topics: [
              { en: "Ohm's law and resistivity (Temperature coefficient)", bn: 'ওহমের সূত্র ও আপেক্ষিক রোধ' },
              { en: 'Combination of resistors and cells', bn: 'রোধ ও কোষের সমবায়' },
              { en: "Kirchhoff's laws and circuit analysis", bn: 'কার্শফের সূত্রাবলী ও বর্তনী সমাধান' },
              { en: 'Wheatstone bridge principle', bn: 'হুইটস্টোন ব্রিজ নীতি' },
              { en: 'Meter bridge and Potentiometer', bn: 'মিটার ব্রিজ ও পটেনশিওমিটার' },
              { en: "Joule's heating effect and electrical power", bn: 'জুলের তাপীয় ক্রিয়া ও বৈদ্যুতিক ক্ষমতা' },
            ]},
            { chapter_no: 4, title_en: 'Magnetic Effects of Current and Magnetism', title_bn: 'তড়িৎ প্রবাহের চৌম্বক ক্রিয়া ও চুম্বকত্ব', topics: [
              { en: "Biot-Savart law and Ampere's circuital law", bn: 'বায়ো-সাভার্তের সূত্র ও অ্যাম্পিয়ারের সূত্র' },
              { en: 'Force on a moving charge and current conductor (Lorentz force)', bn: 'গতিশীল আধান ও পরিবাহীর ওপর চৌম্বক বল' },
              { en: 'Torque on a current loop and galvanometer', bn: 'কারেন্ট লুপের ওপর টর্ক ও গ্যালভানোমিটার' },
              { en: 'Hall effect', bn: 'হল ক্রিয়া' },
              { en: 'Dia, Para, and Ferromagnetism', bn: 'ডায়া, প্যারা ও ফেরোচৌম্বক পদার্থ' },
              { en: "Earth's magnetic elements (Declination, Dip, Horizontal component)", bn: 'ভূ-চুম্বকত্ব (বিচ্যুতি, বিনতি, অনুভূমিক প্রাবল্য)' },
            ]},
            { chapter_no: 5, title_en: 'Electromagnetic Induction and Alternating Current', title_bn: 'তাড়িতচৌম্বক আবেশ ও পরিবর্তী প্রবাহ', topics: [
              { en: "Faraday's laws and Lenz's law", bn: 'ফ্যারাডের সূত্র ও লেঞ্জের সূত্র' },
              { en: 'Self-induction and Mutual-induction', bn: 'স্বকীয় আবেশ ও পারস্পরিক আবেশ' },
              { en: 'AC generator and Transformers', bn: 'এসি জেনারেটর ও ট্রান্সফরমার' },
              { en: 'Peak, Average, and RMS values of AC', bn: 'পরিবর্তী প্রবাহের শীর্ষমান ও আরএমএস মান' },
              { en: 'LCR circuit, Reactance, Impedance, and Resonance', bn: 'LCR বর্তনী, প্রতিঘাত, প্রতিবন্ধকতা ও অনুনাদ' },
            ]},
            { chapter_no: 6, title_en: 'Geometrical Optics', title_bn: 'জ্যামিতিক আলোকবিজ্ঞান', topics: [
              { en: "Refraction at spherical surfaces and Lens Maker's formula", bn: 'গোলীয় তলে প্রতিসরণ ও লেন্স প্রস্তুতকারকের সূত্র' },
              { en: 'Combination of thin lenses in contact', bn: 'যুক্ত লেন্সের তুল্য ক্ষমতা' },
              { en: 'Prism formula, angle of deviation, and dispersion', bn: 'প্রিজম সমীকরণ, ন্যূনতম বিচ্যুতি ও বিচ্ছুরণ' },
              { en: 'Optical instruments (Microscope and Astronomical telescope)', bn: 'আলোক যন্ত্র (অণুবীক্ষণ ও নভোদূরবীক্ষণ যন্ত্র)' },
            ]},
            { chapter_no: 7, title_en: 'Physical Optics', title_bn: 'ভৌত আলোকবিজ্ঞান', topics: [
              { en: "Wavefront and Huygens' principle", bn: 'তরঙ্গমুখ ও হাইগেনসের নীতি' },
              { en: "Interference of light and Young's double-slit experiment", bn: 'আলোর ব্যতিচার ও ইয়ং-এর দ্বি-চির পরীক্ষা' },
              { en: 'Fringe width and condition for bright/dark fringes', bn: 'ডোরার প্রস্থ, উজ্জ্বল ও অন্ধকার ডোরা' },
              { en: 'Diffraction (Single slit and diffraction grating)', bn: 'আলোর অপবর্তন (একক চির ও গ্রেটিং)' },
              { en: "Polarization of light and Brewster's law", bn: 'আলোর সমবর্তন ও ব্রুস্টারের সূত্র' },
            ]},
            { chapter_no: 8, title_en: 'Introduction to Modern Physics', title_bn: 'আধুনিক পদার্থবিজ্ঞানের সূচনা', topics: [
              { en: 'Reference frames (Inertial and Non-inertial)', bn: 'প্রসঙ্গ কাঠামো (জড় ও অজড়)' },
              { en: 'Special theory of relativity postulates', bn: 'আপেক্ষিকতার বিশেষ তত্ত্ব' },
              { en: 'Length contraction, Time dilation, and Mass variation', bn: 'দৈর্ঘ্য সংকোচন, কাল দীর্ঘায়ন ও ভর বৃদ্ধি' },
              { en: 'Mass-Energy equivalence (E = mc^2)', bn: 'ভর-শক্তি সমতা' },
              { en: "Photoelectric effect and Einstein's equation", bn: 'আলোক তড়িৎ ক্রিয়া ও আইনস্টাইনের সমীকরণ' },
              { en: 'Compton effect and De Broglie wavelength', bn: 'কম্পটন ক্রিয়া ও ডি-ব্রগলি তরঙ্গদৈর্ঘ্য' },
              { en: 'Heisenberg uncertainty principle', bn: 'হাইজেনবার্গের অনিশ্চয়তা নীতি' },
            ]},
            { chapter_no: 9, title_en: 'Atomic Model and Nuclear Physics', title_bn: 'পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান', topics: [
              { en: 'Rutherford and Bohr atomic models', bn: 'রাদারফোর্ড ও বোর পরমাণু মডেল' },
              { en: 'Hydrogen spectrum and Rydberg constant', bn: 'হাইড্রোজেন বর্ণালী ও রিডবার্গ ধ্রুবক' },
              { en: 'Radioactive decay law and decay constant', bn: 'তেজস্ক্রিয় ক্ষয় সূত্র ও ক্ষয় ধ্রুবক' },
              { en: 'Half-life and mean-life', bn: 'অর্ধায়ু ও গড় আয়ু' },
              { en: 'Mass defect and binding energy', bn: 'ভর ত্রুটি ও বন্ধন শক্তি' },
              { en: 'Nuclear fission and fusion', bn: 'নিউক্লীয় ফিশন ও ফিউশন' },
            ]},
            { chapter_no: 10, title_en: 'Semiconductor and Electronics', title_bn: 'সেমিকন্ডাক্টর ও ইলেকট্রনিক্স', topics: [
              { en: 'Energy bands, Intrinsic and Extrinsic semiconductors', bn: 'শক্তি ব্যান্ড, বিশুদ্ধ ও অবিশুদ্ধ অর্ধপরিবাহী' },
              { en: 'P-N junction diode and rectification (Half & Full wave)', bn: 'P-N জাংশন ডায়োড ও রেকটিফিকেশন' },
              { en: 'Bipolar junction transistor (Action, configurations, CE amplifier)', bn: 'ট্রানজিস্টর গঠন ও বিবর্ধক হিসেবে ব্যবহার' },
              { en: 'Logic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR)', bn: 'লজিক গেট ও সত্যক সারণি' },
            ]},
            { chapter_no: 11, title_en: 'Astronomy', title_bn: 'জ্যোতির্বিজ্ঞান', topics: [
              { en: 'Big Bang theory and structure of the universe', bn: 'মহাবিস্ফোরণ তত্ত্ব ও মহাবিশ্বের গঠন' },
              { en: 'Stellar evolution, Red giants, and White dwarfs', bn: 'নক্ষত্রের বিবর্তন, লোহিত দানব ও শ্বেত বামন' },
              { en: 'Supernova, Neutron stars, and Black holes', bn: 'সুপারনোভা, নিউট্রন স্টার ও ব্ল্যাক হোল' },
              { en: "Hubble's law and expanding universe", bn: 'হাবলের সূত্র ও সম্প্রসারণশীল মহাবিশ্ব' },
            ]},
          ],
        },
      ],
    },
    {
      id: 'chemistry',
      name_en: 'Chemistry',
      name_bn: 'রসায়ন',
      papers: [
        {
          paper: 1,
          name_en: 'Chemistry 1st Paper',
          name_bn: 'রসায়ন ১ম পত্র',
          chapters: [
            { chapter_no: 1, title_en: 'Safe Use of Laboratory', title_bn: 'ল্যাবরেটরির নিরাপদ ব্যবহার', topics: [
              { en: 'Lab safety rules and hazard symbols (GHS)', bn: 'ল্যাবরেটরি ব্যবহারের সুরক্ষা বিধি ও হ্যাজার্ড প্রতীক' },
              { en: 'Glass apparatus calibration and cleaning', bn: 'কাঁচ সামগ্রী ব্যবহার ও পরিষ্কারকরণ' },
              { en: 'Chemical storage and disposal methods', bn: 'রাসায়নিক দ্রব্য সংরক্ষণ ও বর্জ্য অপসারণ' },
              { en: 'First aid in the chemistry laboratory', bn: 'প্রাথমিক চিকিৎসা' },
            ]},
            { chapter_no: 2, title_en: 'Qualitative Chemistry', title_bn: 'গুণগত রসায়ন', topics: [
              { en: 'Rutherford and Bohr atomic models, limitatons', bn: 'রাদারফোর্ড ও বোর পরমাণু মডেল' },
              { en: 'Quantum numbers and electronic configurations', bn: 'কোয়ান্টাম সংখ্যা ও ইলেকট্রন বিন্যাস' },
              { en: "Aufbau principle, Hund's rule, Pauli exclusion principle", bn: 'আউফবাউ, হুন্ড ও পাউলির বর্জন নীতি' },
              { en: 'Solubility and solubility product (Ksp)', bn: 'দ্রাব্যতা ও দ্রাব্যতা গুণফল' },
              { en: 'Common ion effect and qualitative ion analysis', bn: 'সম-আয়ন প্রভাব ও ক্যাটায়ন/অ্যানায়ন শনাক্তকরণ' },
              { en: 'Chromatography and distillation techniques', bn: 'ক্রোমাটোগ্রাফি ও পাতন প্রণালী' },
            ]},
            { chapter_no: 3, title_en: 'Periodic Properties and Chemical Bonding', title_bn: 'পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন', topics: [
              { en: 'Periodic table classification (s, p, d, f blocks)', bn: 'পর্যায় সারণি ও ব্লকভিত্তিক শ্রেণিবিভাগ' },
              { en: 'Periodic properties (Atomic radius, Ionization energy, Electron affinity, Electronegativity)', bn: 'পর্যায়বৃত্ত ধর্ম (ব্যাসার্ধ, আয়নীকরণ শক্তি, ইলেকট্রন আসক্তি, তড়িৎ ঋণাত্মকতা)' },
              { en: 'Orbital hybridization and molecular shapes (VSEPR theory)', bn: 'সংকরায়ন ও অণুর আকৃতি (VSEPR তত্ত্ব)' },
              { en: 'Ionic, Covalent, and Coordinate covalent bonds', bn: 'আয়নিক, সমযোজী ও সন্নিবেশ বন্ধন' },
              { en: "Fajan's rule and polarization", bn: 'ফাযানের নীতি ও পোলারায়ন' },
              { en: 'Hydrogen bond and Van der Waals forces', bn: 'হাইড্রোজেন বন্ধন ও ভ্যান ডার ওয়ালস বল' },
            ]},
            { chapter_no: 4, title_en: 'Chemical Changes', title_bn: 'রাসায়নিক পরিবর্তন', topics: [
              { en: 'Reversible reactions and dynamic equilibrium', bn: 'উভমুখী বিক্রিয়া ও সাম্যাবস্থা' },
              { en: "Le Chatelier's principle and applications", bn: 'লা-শাতেলিয়ের নীতি ও এর প্রভাব' },
              { en: 'Law of mass action, Kp and Kc expressions/calculations', bn: 'ভরক্রিয়া সূত্র, Kp ও Kc এর সম্পর্ক ও গাণিতিক রূপ' },
              { en: 'Arrhenius equation and activation energy', bn: 'আরহেনিয়াস সমীকরণ ও সক্রিয়ণ শক্তি' },
              { en: 'pH, pOH calculations and buffer solutions (Henderson-Hasselbalch equation)', bn: 'pH, বাফার দ্রবণ ও হ্যান্ডারসন-হ্যাসেলবাক সমীকরণ' },
              { en: "Thermochemistry and Hess's law", bn: 'তাপরসায়ন ও হেসের তাপ সমষ্টিকরণ সূত্র' },
            ]},
            { chapter_no: 5, title_en: 'Applied Chemistry', title_bn: 'কর্মমুখী রসায়ন', topics: [
              { en: 'Food preservation mechanisms and chemical preservatives', bn: 'খাদ্য নিরাপত্তা ও প্রিজারভেটিভস' },
              { en: 'Preparation and preservation of vinegar', bn: 'ভিনেগার তৈরি ও খাদ্য সংরক্ষণ কৌশল' },
              { en: 'Preparation of toilet and herbal products (Soap, Shampoo, Cold cream)', bn: 'টয়লেট্রিজ ও কসমেটিকস সামগ্রী প্রস্তুতি' },
            ]},
          ],
        },
        {
          paper: 2,
          name_en: 'Chemistry 2nd Paper',
          name_bn: 'রসায়ন ২য় পত্র',
          chapters: [
            { chapter_no: 1, title_en: 'Environmental Chemistry', title_bn: 'পরিবেশ রসায়ন', topics: [
              { en: 'Gas laws (Boyle, Charles, Avogadro, Dalton, Graham)', bn: 'গ্যাসের সূত্রাবলী (বয়েল, চার্লস, ডাল্টনের আংশিক চাপ, গ্রাহামের ব্যাপন)' },
              { en: 'Kinetic molecular theory and Van der Waals equation', bn: 'আণবিক গতিতত্ত্ব ও ভ্যান ডার ওয়ালস সমীকরণ' },
              { en: 'Atmospheric components and pollution (Greenhouse effect, Acid rain)', bn: 'বায়ুমণ্ডলের উপাদান, গ্রিনহাউস প্রভাব ও অ্যাসিড বৃষ্টি' },
              { en: 'Surface water quality parameters (DO, BOD, COD, TDS)', bn: 'পানির গুণমান পরিমাপক (DO, BOD, COD, TDS)' },
              { en: 'Acid-base theories (Arrhenius, Bronsted-Lowry, Lewis)', bn: 'অম্ল-ক্ষারক মতবাদ (আরহেনিয়াস, ব্রনস্টেড-লাউরি, লুইস)' },
            ]},
            { chapter_no: 2, title_en: 'Organic Chemistry', title_bn: 'জৈব রসায়ন', topics: [
              { en: 'Hybridization, functional groups, and IUPAC nomenclature', bn: 'সংকরায়ন, কার্যকরী মূলক ও ইউপ্যাক নামকরণ' },
              { en: 'Isomerism (Structural and Stereoisomerism - Optical, Geometric)', bn: 'সমাণুতা (গাঠনিক ও স্টেরিও - জ্যামিতিক, আলোক)' },
              { en: "Alkanes, Alkenes, Alkynes (Markovnikov's rule, ozonolysis)", bn: 'অ্যালিফেটিক হাইড্রোকার্বন (মার্কনিকভ নীতি, ওজোনোলাইসিস)' },
              { en: 'Aromaticity (Hückel rule), Benzene reactions and electrophilic substitution', bn: 'অ্যারোমেটিসিটি, বেনজিন ও ইলেকট্রোফিলিক প্রতিস্থাপন' },
              { en: 'Alkyl halides and Nucleophilic substitution (SN1, SN2, E1, E2)', bn: 'অ্যালকাইল হ্যালাইড ও নিউক্লিওফিলিক প্রতিস্থাপন' },
              { en: 'Alcohols, Phenols, and Ethers', bn: 'অ্যালকোহল, ফেনল ও ইথার' },
              { en: 'Aldehydes and Ketones (Nucleophilic addition, Aldol, Cannizzaro)', bn: 'অ্যালডিহাইড ও কিটোন (অ্যালডল ঘনীভবন, ক্যানিজারো)' },
              { en: 'Carboxylic acids, esters, and derivatives', bn: 'কার্বক্সিলিক অ্যাসিড ও এর জাতক' },
              { en: 'Amines, Diazonium salts, and Polimerization reactions', bn: 'অ্যামিন, ডায়াজোনিয়াম লবণ ও পলিমার' },
            ]},
            { chapter_no: 3, title_en: 'Quantitative Chemistry', title_bn: 'পরিমাণগত রসায়ন', topics: [
              { en: 'Mole concept, standard solution, and concentration units (Molarity, Molality, ppm)', bn: 'মোল ধারণা, প্রমাণ দ্রবণ ও ঘনমাত্রার একক' },
              { en: 'Volumetric titration and neutralization curves', bn: 'আয়তনমাত্রিক বিশ্লেষণ ও টাইট্রেশন' },
              { en: 'Oxidation-Reduction reactions and ion-electron balancing', bn: 'জারণ-বিজারণ সমতাকরণ (আয়ন-ইলেকট্রন পদ্ধতি)' },
              { en: 'Redox titrations (Permanganometry, Iodometry, Iodimetry)', bn: 'রেডক্স টাইট্রেশন (জারক-বিজারক পরিমাপন)' },
              { en: 'Beer-Lambert law and spectrophotometry', bn: 'বিয়ার-ল্যাম্বার্ট সূত্র' },
            ]},
            { chapter_no: 4, title_en: 'Electrochemistry', title_bn: 'তড়িৎ রসায়ন', topics: [
              { en: "Electrolysis and Faraday's laws of electrolysis", bn: 'তড়িৎ বিশ্লেষণ ও ফ্যারাডের সূত্রাবলী' },
              { en: 'Galvanic cell, standard electrode potential, and EMF', bn: 'গ্যালভানিক কোষ, প্রমাণ তড়িৎদ্বার বিভব ও ইএমএফ' },
              { en: 'Nernst equation calculations', bn: 'নার্নস্ট সমীকরণ ও কোষ বিভব নির্ণয়' },
              { en: 'Lead-acid storage battery and Lithium-ion battery', bn: 'লেড-অ্যাসিড ও লিথিয়াম আয়ন ব্যাটারি' },
              { en: 'Fuel cells and corrosion prevention', bn: 'ফুয়েল সেল ও ধাতুর ক্ষয় রোধ' },
            ]},
            { chapter_no: 5, title_en: 'Economic Chemistry', title_bn: 'অর্থনৈতিক রসায়ন', topics: [
              { en: 'Natural gas composition and utilization', bn: 'প্রাকৃতিক গ্যাস ও কয়লার প্রক্রিয়াকরণ' },
              { en: 'Urea fertilizer manufacturing process', bn: 'ইউরিয়া সার উৎপাদন পদ্ধতি' },
              { en: 'Cement, paper, and ceramic industries', bn: 'সিমেন্ট, পাল্প-কাগজ ও সিরামিক শিল্প' },
              { en: 'Leather tanning and pollution management', bn: 'চামড়া ট্যানিং ও বর্জ্য ব্যবস্থাপনা' },
              { en: 'Industrial effluents and ETP operations', bn: 'শিল্পবর্জ্য ও ইটিপি (ETP) ব্যবস্থা' },
            ]},
          ],
        },
      ],
    },
    {
      id: 'higher_math',
      name_en: 'Higher Mathematics',
      name_bn: 'উচ্চতর গণিত',
      papers: [
        {
          paper: 1,
          name_en: 'Higher Mathematics 1st Paper',
          name_bn: 'উচ্চতর গণিত ১ম পত্র',
          chapters: [
            { chapter_no: 1, title_en: 'Matrices and Determinants', title_bn: 'ম্যাট্রিক্স ও নির্ণায়ক', topics: [
              { en: 'Types of matrices and algebra (Addition, multiplication)', bn: 'ম্যাট্রিক্সের প্রকারভেদ ও গুণন' },
              { en: 'Determinant properties, minors, and cofactors', bn: 'নির্ণায়কের অনুরাশি, সহগুণক ও মান নির্ণয়' },
              { en: 'Inverse of a matrix', bn: 'বিপরীত ম্যাট্রিক্স' },
              { en: "Solving linear systems using Cramer's rule", bn: 'ক্র্যামারের নিয়মে সমাধান' },
            ]},
            { chapter_no: 2, title_en: 'Vectors', title_bn: 'ভেক্টর', topics: [
              { en: 'Position vectors and direction cosines', bn: 'অবস্থান ভেক্টর ও দিক কোসাইন' },
              { en: 'Dot and cross product applications', bn: 'স্কেলার ও ভেক্টর গুণন প্রয়োগ' },
              { en: 'Projections and components', bn: 'অভিক্ষেপ ও উপাংশ নির্ণয়' },
              { en: 'Area of triangles and parallelograms using vectors', bn: 'ক্ষেত্রফল নির্ণয়ে ভেক্টর' },
            ]},
            { chapter_no: 3, title_en: 'Straight Lines', title_bn: 'সরলরেখা', topics: [
              { en: 'Coordinate system and section formula', bn: 'স্থানাঙ্ক জ্যামিতি ও বিভক্তিকরণ সূত্র' },
              { en: 'Area of polygons', bn: 'বহুভুজের ক্ষেত্রফল' },
              { en: 'Slope and forms of straight lines', bn: 'ঢাল ও সরলরেখার বিভিন্ন সমীকরণ' },
              { en: 'Angle between two intersecting lines', bn: 'দুটি সরলরেখার মধ্যবর্তী কোণ' },
              { en: 'Perpendicular distance from a point to a line', bn: 'বিন্দু হতে রেখার লম্ব দূরত্ব' },
              { en: 'Angle bisectors and concurrent lines', bn: 'কোণের সমদ্বিখণ্ডক ও সমবিন্দু রেখা' },
            ]},
            { chapter_no: 4, title_en: 'Circles', title_bn: 'বৃত্ত', topics: [
              { en: 'Standard and general equations of a circle', bn: 'বৃত্তের প্রমিত ও সাধারণ সমীকরণ' },
              { en: 'Circles passing through given points or touching axes', bn: 'অক্ষ স্পর্শকারী বৃত্ত ও বিন্দু দিয়ে গমনকারী বৃত্ত' },
              { en: 'Equation of tangent and normal', bn: 'স্পর্শক ও অভিলম্বের সমীকরণ' },
              { en: 'Condition of tangency and length of tangent', bn: 'স্পর্শক হওয়ার শর্ত ও স্পর্শকের দৈর্ঘ্য' },
              { en: 'Common chord and intersection of two circles', bn: 'সাধারণ জ্যা ও দুটি বৃত্তের ছেদবিন্দু' },
            ]},
            { chapter_no: 5, title_en: 'Permutations and Combinations', title_bn: 'বিন্যাস ও সমাবেশ', topics: [
              { en: 'Fundamental principle of counting and factorial', bn: 'গণনার মৌলিক নীতি ও ফ্যাক্টোরিয়াল' },
              { en: 'Linear and circular permutations (nPr)', bn: 'রৈখিক ও চক্রাকার বিন্যাস' },
              { en: 'Permutations with repetition and restricted arrangements', bn: 'শব্দের বিন্যাস ও শর্তযুক্ত বিন্যাস' },
              { en: 'Combinations and group formations (nCr)', bn: 'সমাবেশ ও দল গঠন' },
              { en: 'Geometric combinations (Triangles, diagonals from points)', bn: 'জ্যামিতিক ক্ষেত্রে সমাবেশের প্রয়োগ' },
            ]},
            { chapter_no: 6, title_en: 'Trigonometric Ratios', title_bn: 'ত্রিকোণমিতিক অনুপাত', topics: [
              { en: 'Measurement of angles (Radian and Degree)', bn: 'কোণের পরিমাপ (রেডিয়ান ও ডিগ্রি)' },
              { en: 'Trigonometric ratios in different quadrants', bn: 'বিভিন্ন চতুর্ভাগে ত্রিকোণমিতিক অনুপাত' },
              { en: 'Trigonometric identities and proofs', bn: 'ত্রিকোণমিতিক অভেদাবলী' },
            ]},
            { chapter_no: 7, title_en: 'Associated Angles and Compound Angles', title_bn: 'সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত', topics: [
              { en: 'Ratios of (-theta) and (n*90 +/- theta)', bn: 'সংযুক্ত কোণের অনুপাত নির্ণয়' },
              { en: 'Compound angles formulas: sin(A+B), cos(A+B), tan(A+B)', bn: 'যৌগিক কোণের সূত্রাবলী' },
              { en: 'Transformation of product into sum/difference and vice versa', bn: 'গুণফল ও যোগফলের রূপান্তর' },
              { en: 'Multiple and submultiple angles (2A, 3A, A/2)', bn: 'গুণিতক ও উপ-গুণিতক কোণ' },
              { en: 'Properties and solutions of triangles (Sine and Cosine rules)', bn: 'ত্রিভুজের গুণাবলী (সাইন ও কোসাইন সূত্র)' },
            ]},
            { chapter_no: 8, title_en: 'Functions and Graphs', title_bn: 'ফাংশন ও ফাংশনের লেখচিত্র', topics: [
              { en: 'Domain, codomain, and range of real functions', bn: 'ডোমেন, কো-ডোমেন ও রেঞ্জ নির্ণয়' },
              { en: 'One-to-one, onto, and composite functions', bn: 'এক-এক, সার্বিক ও সংযোজিত ফাংশন' },
              { en: 'Inverse functions', bn: 'বিপরীত ফাংশন' },
              { en: 'Graphs of algebraic, exponential, and trigonometric functions', bn: 'বিভিন্ন ফাংশনের লেখচিত্র' },
            ]},
            { chapter_no: 9, title_en: 'Differentiation', title_bn: 'অন্তরীকরণ', topics: [
              { en: "Concept of limits and L'Hopital's rule", bn: 'লিমিটের ধারণা ও এল-হসপিটাল নিয়ম' },
              { en: 'Differentiation from first principles', bn: 'মূল নিয়মে অন্তরজ নির্ণয়' },
              { en: 'Product, Quotient, and Chain rule', bn: 'গুণন, ভাগফল ও চেইন রুল' },
              { en: 'Implicit and logarithmic differentiation', bn: 'অব্যক্ত ও লগারিদমিক অন্তরীকরণ' },
              { en: 'Successive differentiation and Leibniz theorem', bn: 'পর্যায়ক্রমিক অন্তরীকরণ' },
              { en: 'Tangents and normals to curves', bn: 'স্পর্শক ও অভিলম্বের সমীকরণ' },
              { en: 'Maxima and minima (Increasing/Decreasing functions)', bn: 'গুরুমান, লঘুমান ও বৃদ্ধির হার' },
            ]},
            { chapter_no: 10, title_en: 'Integration', title_bn: 'যৌগজীকরণ', topics: [
              { en: 'Indefinite integral formulas and standard forms', bn: 'অনির্দিষ্ট যোগজ ও প্রমিত সূত্র' },
              { en: 'Integration by substitution', bn: 'প্রতিস্থাপন পদ্ধতি' },
              { en: 'Integration by parts', bn: 'অংশায়ন সূত্র (By Parts)' },
              { en: 'Integration of rational and trigonometric fractions', bn: 'আংশিক ভগ্নাংশ ও বিশেষ আকারের ইন্টিগ্রেশন' },
              { en: 'Definite integrals and fundamental theorem of calculus', bn: 'নির্দিষ্ট যোগজ ও বৈশিষ্ট্য' },
              { en: 'Area under curves using integration', bn: 'যোগজীকরণের সাহায্যে ক্ষেত্রফল নির্ণয়' },
            ]},
          ],
        },
        {
          paper: 2,
          name_en: 'Higher Mathematics 2nd Paper',
          name_bn: 'উচ্চতর গণিত ২য় পত্র',
          chapters: [
            { chapter_no: 1, title_en: 'Real Numbers and Inequalities', title_bn: 'বাস্তব সংখ্যা ও অসমতা', topics: [
              { en: 'Properties of real numbers, infimum and supremum', bn: 'বাস্তব সংখ্যার স্বতঃসিদ্ধ, সুপ্রিমাম ও ইনফিমাম' },
              { en: 'Solving linear and absolute value inequalities', bn: 'পরমমান সংবলিত অসমতার সমাধান' },
              { en: 'Representation of solutions on number line', bn: 'সংখ্যারেখায় অসমতার প্রকাশ' },
            ]},
            { chapter_no: 2, title_en: 'Linear Programming', title_bn: 'যোগাশ্রয়ী প্রোগ্রাম', topics: [
              { en: 'Formulation of linear programming problems (Objective function, Constraints)', bn: 'যোগাশ্রয়ী মডেল গঠন' },
              { en: 'Graphical method and feasible region determination', bn: 'লেখচিত্র পদ্ধতি ও কার্যকর অঞ্চল' },
              { en: 'Maximization and minimization problems', bn: 'সর্বোচ্চকরণ ও সর্বনিম্নকরণ সমাধান' },
            ]},
            { chapter_no: 3, title_en: 'Complex Numbers', title_bn: 'জটিল সংখ্যা', topics: [
              { en: 'Modulus and argument in Argand diagram', bn: 'মডুলাস, আর্গুমেন্ট ও আরগ্যান্ড চিত্র' },
              { en: "Polar and exponential form (Euler's formula)", bn: 'পোলার ও অয়লারীয় রূপ' },
              { en: 'Square root, cube roots of unity and fourth roots', bn: 'বর্গমূল, এককের ঘনমূল ও চতুর্মূল' },
              { en: 'Locus problems of complex numbers', bn: 'জটিল সংখ্যার সঞ্চারপথ' },
            ]},
            { chapter_no: 4, title_en: 'Polynomials and Polynomial Equations', title_bn: 'বহুপদী ও বহুপদী সমীকরণ', topics: [
              { en: 'Remainder and factor theorem', bn: 'ভাগশেষ উপপাদ্য ও উৎপাদক উপপাদ্য' },
              { en: 'Relations between roots and coefficients (Quadratic and Cubic)', bn: 'দ্বিঘাত ও ত্রিঘাত সমীকরণের মূল ও সহগের সম্পর্ক' },
              { en: 'Nature of roots and discriminant', bn: 'মূলের প্রকৃতি ও নিশ্চয়ক' },
              { en: 'Forming equations with given roots and common roots conditions', bn: 'সমীকরণ গঠন ও সাধারণ মূল থাকার শর্ত' },
            ]},
            { chapter_no: 5, title_en: 'Binomial Expansion', title_bn: 'দ্বিপদী বিস্তার', topics: [
              { en: 'Binomial theorem for positive integer power', bn: 'ধনাত্মক পূর্ণসাংখ্যিক ঘাতের বিস্তার' },
              { en: 'General term, middle term, and independent of x term', bn: 'সাধারণ পদ, মধ্যপদ ও x-বর্জিত পদ নির্ণয়' },
              { en: 'Binomial theorem for any index (Negative/Fractional)', bn: 'যেকোনো সূচকের জন্য দ্বিপদী বিস্তার' },
            ]},
            { chapter_no: 6, title_en: 'Conics', title_bn: 'কণিক', topics: [
              { en: 'Standard equation and characteristics of Parabola', bn: 'পরাবৃত্তের সমীকরণ ও বৈশিষ্ট্য' },
              { en: 'Standard equation and characteristics of Ellipse', bn: 'উপবৃত্তের সমীকরণ, উৎকেন্দ্রিকতা ও উপকেন্দ্র' },
              { en: 'Standard equation and characteristics of Hyperbola', bn: 'অধিবৃত্তের সমীকরণ ও অসীমমুখী রেখা' },
              { en: 'Equations of tangents to conics', bn: 'কণিকের স্পর্শকের সমীকরণ' },
            ]},
            { chapter_no: 7, title_en: 'Inverse Trigonometric Functions and Equations', title_bn: 'বিপরীত ত্রিকোণমিতিক ফাংশন ও সমীকরণ', topics: [
              { en: 'Domain, range, and graphs of inverse trig functions', bn: 'বিপরীত ফাংশনের ডোমেন, রেঞ্জ ও বৈশিষ্ট্য' },
              { en: 'Identities and transformations involving sin^-1, cos^-1, tan^-1', bn: 'বিপরীত ত্রিকোণমিতিক অভেদাবলীর রূপান্তর' },
              { en: 'General solutions of trigonometric equations in given intervals', bn: 'ত্রিকোণমিতিক সমীকরণের সাধারণ সমাধান' },
            ]},
            { chapter_no: 8, title_en: 'Statics', title_bn: 'স্থিতিবিদ্যা', topics: [
              { en: 'Parallelogram law of forces and resultant', bn: 'বলের সামান্তরিক সূত্র ও লব্ধি' },
              { en: "Equilibrium of coplanar forces and Lami's theorem", bn: 'সমতলীয় বলের সাম্যাবস্থা ও লামির উপপাদ্য' },
              { en: 'Parallel forces (Like and Unlike) and Center of mass', bn: 'সদৃশ ও অসদৃশ সমান্তরাল বল' },
              { en: "Moments, couples, and Varignon's theorem", bn: 'বলের ভ্রামক ও যুগল' },
            ]},
            { chapter_no: 9, title_en: 'Planar Motion of Particles', title_bn: 'সমতলে বস্তুকণার গতি', topics: [
              { en: 'Rectilinear motion with variable/uniform acceleration', bn: 'সরলরেখায় সমত্বরণ ও পরিবর্তনশীল ত্বরণে গতি' },
              { en: 'Motion under gravity and vertical projection', bn: 'অভিকর্ষের অধীনে উলম্ব গতি' },
              { en: 'Projectile motion on horizontal and inclined planes', bn: 'অনুভূমিক ও হেলানো তলে প্রাস' },
              { en: 'Relative velocity and collision of particles', bn: 'আপেক্ষিক গতি ও সংঘর্ষ' },
            ]},
            { chapter_no: 10, title_en: 'Measures of Dispersion and Probability', title_bn: 'বিস্তার পরিমাপ ও সম্ভাবনা', topics: [
              { en: 'Mean deviation, variance, and standard deviation', bn: 'গড় ব্যবধান, ভেদাঙ্ক ও পরিমিত ব্যবধান' },
              { en: 'Coefficient of variation', bn: 'বিভেদাঙ্ক' },
              { en: 'Basic rules of probability (Addition and Multiplication)', bn: 'সম্ভাবনার যোগ ও গুণন সূত্র' },
              { en: 'Conditional probability and independent events', bn: 'শর্তাধীন সম্ভাবনা ও স্বাধীন ঘটনা' },
            ]},
          ],
        },
      ],
    },
    {
      id: 'biology',
      name_en: 'Biology',
      name_bn: 'জীববিজ্ঞান',
      papers: [
        {
          paper: 1,
          name_en: 'Biology 1st Paper (Botany)',
          name_bn: 'জীববিজ্ঞান ১ম পত্র (উদ্ভিদবিজ্ঞান)',
          chapters: [
            { chapter_no: 1, title_en: 'Cell and its Structure', title_bn: 'কোষ ও এর গঠন', topics: [
              { en: 'Cell wall and plasma membrane (Fluid mosaic model)', bn: 'কোষপ্রাচীর ও ফ্লুইড মোজাইক মডেল' },
              { en: 'Cytoplasmic organelles (Mitochondria, Chloroplast, Ribosome)', bn: 'কোষীয় অঙ্গাণু (মাইটোকন্ড্রিয়া, ক্লোরোপ্লাস্ট, রাইবোসোম)' },
              { en: 'Nucleus, chromosome structure, and nucleosome', bn: 'নিউক্লিয়াস ও ক্রোমোজোম' },
              { en: 'DNA structure (Watson-Crick model) and RNA types', bn: 'DNA ডাবল হেলিক্স ও RNA প্রকারভেদ' },
              { en: 'Central dogma: DNA Replication, Transcription, Translation', bn: 'রেপ্লিকেশন, ট্রান্সক্রিপশন ও ট্রান্সলেশন' },
            ]},
            { chapter_no: 2, title_en: 'Cell Division', title_bn: 'কোষ বিভাজন', topics: [
              { en: 'Cell cycle and Amitosis', bn: 'কোষচক্র ও অ্যামাইটোসিস' },
              { en: 'Stages of Mitosis and significance', bn: 'মাইটোসিসের ধাপসমূহ ও গুরুত্ব' },
              { en: 'Meiosis I and Meiosis II processes', bn: 'মায়োসিসের পর্যায়সমূহ' },
              { en: 'Crossing over and genetic variations', bn: 'ক্রসিং ওভার ও এর গুরুত্ব' },
            ]},
            { chapter_no: 3, title_en: 'Cell Chemistry', title_bn: 'কোষ রসায়ন', topics: [
              { en: 'Carbohydrates (Mono, di, and polysaccharides)', bn: 'কার্বোহাইড্রেট ও শ্রেণিবিভাগ' },
              { en: 'Amino acids and proteins (Structure and classification)', bn: 'অ্যামিনো অ্যাসিড ও প্রোটিনের গঠন' },
              { en: 'Lipids (Simple, compound, and derived)', bn: 'লিপিডের শ্রেণিবিভাগ' },
              { en: 'Enzymes (Lock and key hypothesis, Allosteric regulation)', bn: 'এনজাইমের ক্রিয়া কৌশল ও বৈশিষ্ট্য' },
            ]},
            { chapter_no: 4, title_en: 'Microorganisms', title_bn: 'অণুজীব', topics: [
              { en: 'Viruses (Structure of T2 phage and HIV, Lytic/Lysogenic cycle)', bn: 'ভাইরাসের গঠন, লাইটিক ও লাইসোজেনিক চক্র' },
              { en: 'Bacteria (Structure, Gram-staining, Economic importance)', bn: 'ব্যাকটেরিয়ার গঠন ও অর্থনৈতিক গুরুত্ব' },
              { en: 'Plasmodium (Life cycle of malaria parasite in human and mosquito)', bn: 'ম্যালেরিয়া পরজীবীর জীবনচক্র' },
              { en: 'Plant and human diseases caused by microbes', bn: 'ভাইরাস ও ব্যাকটেরিয়াজনিত রোগ' },
            ]},
            { chapter_no: 5, title_en: 'Algae and Fungi', title_bn: 'শৈবাল ও ছত্রাক', topics: [
              { en: 'Characteristics and reproduction of Algae (Spirogyra)', bn: 'শৈবালের গঠন ও জনন' },
              { en: 'Characteristics and reproduction of Fungi (Agaricus)', bn: 'ছত্রাকের গঠন ও এগারিকাসের জীবনচক্র' },
              { en: 'Lichens and economic importance of algae/fungi', bn: 'লাইকেন ও অর্থনৈতিক গুরুত্ব' },
            ]},
            { chapter_no: 6, title_en: 'Bryophyta and Pteridophyta', title_bn: 'ব্রায়োফাইটা ও টেরিডোফাইটা', topics: [
              { en: 'Characteristics and reproduction of Bryophyta (Riccia)', bn: 'ব্রায়োফাইটা ও রিকসিয়ার গঠন' },
              { en: 'Characteristics and life cycle of Pteridophyta (Pteris)', bn: 'টেরিডোফাইটা ও ফার্নের প্রোথ্যালাস' },
              { en: 'Alternation of generations', bn: 'জনুক্রমের ধারণা' },
            ]},
            { chapter_no: 7, title_en: 'Gymnosperms and Angiosperms', title_bn: 'নগ্নবীজী ও আবৃতবীজী উদ্ভিদ', topics: [
              { en: 'Characteristics and life history of Cycas', bn: 'সাইকাসের বৈশিষ্ট্য ও গঠন' },
              { en: 'Inflorescence, flower structure, and placentation', bn: 'পুষ্পমঞ্জরি ও অমরাবিন্যাস' },
              { en: 'Identification and features of Malvaceae family', bn: 'মালভেসি গোত্রের বৈশিষ্ট্য ও উদাহরণ' },
              { en: 'Identification and features of Poaceae family', bn: 'পোয়েসি গোত্রের বৈশিষ্ট্য ও উদাহরণ' },
            ]},
            { chapter_no: 8, title_en: 'Tissue and Tissue Systems', title_bn: 'টিস্যু ও টিস্যুতন্ত্র', topics: [
              { en: 'Meristematic tissues classification', bn: 'ভাজক টিস্যুর প্রকারভেদ' },
              { en: 'Epidermal and Ground tissue systems', bn: 'ত্বকীয় ও গ্রাউন্ড টিস্যুতন্ত্র' },
              { en: 'Vascular bundle types (Radial, Conjoint, Concentric)', bn: 'সংবহন বান্ডলের প্রকারভেদ' },
              { en: 'Internal anatomy of monocot root and stem', bn: 'একবীজপত্রী মূল ও কাণ্ডের অন্তর্গঠন' },
            ]},
            { chapter_no: 9, title_en: 'Plant Physiology', title_bn: 'উদ্ভিদ শারীরতত্ত্ব', topics: [
              { en: 'Mineral absorption mechanism (Active and passive)', bn: 'খনিজ লবণ শোষণ প্রক্রিয়া' },
              { en: 'Transpiration and stomatal mechanism', bn: 'প্রস্বেদন ও পত্ররন্ধ্রীয় কৌশল' },
              { en: 'Photosynthesis: Light dependent reaction and photophosphorylation', bn: 'সালোকসংশ্লেষণ: আলোক পর্যায়' },
              { en: 'Dark reactions: Calvin cycle (C3), Hatch-Slack cycle (C4), CAM', bn: 'অন্ধকার পর্যায়: C3 ও C4 চক্র' },
              { en: 'Respiration: Glycolysis, Acetyl-CoA, Krebs cycle, and ETS', bn: 'শ্বসন: গ্লাইকোলাইসিস ও ক্রেবস চক্র' },
              { en: 'Fermentation and factors affecting photosynthesis/respiration', bn: 'অবাধ শ্বসন ও গাঁজন' },
            ]},
            { chapter_no: 10, title_en: 'Plant Reproduction', title_bn: 'উদ্ভিদ প্রজনন', topics: [
              { en: 'Microsporogenesis and male gametophyte development', bn: 'পুং-গ্যামেটোফাইটের উৎপত্তি' },
              { en: 'Megasporogenesis and female gametophyte development', bn: 'স্ত্রী-গ্যামেটোফাইটের উৎপত্তি' },
              { en: 'Fertilization and post-fertilization changes (Seed/Fruit formation)', bn: 'নিষেক ও দ্বিনিষেক প্রক্রিয়া' },
              { en: 'Apomixis and parthenogenesis', bn: 'অ্যাপোমিক্সিস ও পার্থেনোজেনেসিস' },
            ]},
            { chapter_no: 11, title_en: 'Biotechnology', title_bn: 'জীবপ্রযুক্তি', topics: [
              { en: 'Plant tissue culture techniques and applications', bn: 'টিস্যু কালচার পদ্ধতি ও প্রয়োগ' },
              { en: 'Recombinant DNA technology (Gene cloning and vectors)', bn: 'রিকম্বিন্যান্ট DNA প্রযুক্তি ধাপসমূহ' },
              { en: 'Transgenic plants and GM crops', bn: 'ট্রান্সজেনিক উদ্ভিদ ও জিএমও' },
              { en: 'Applications of biotechnology in agriculture and medicine', bn: 'কৃষি ও চিকিৎসায় জীবপ্রযুক্তি' },
            ]},
            { chapter_no: 12, title_en: 'Environment, Distribution, and Conservation of Organisms', title_bn: 'পরিবেশ, জীবের বিস্তার ও সংরক্ষণ', topics: [
              { en: 'Ecosystem components, energy flow, and trophic levels', bn: 'বাস্তুতন্ত্রের উপাদান ও শক্তি প্রবাহ' },
              { en: 'Ecological adaptations of plants (Hydrophytes, Xerophytes, Halophytes)', bn: 'উদ্ভিদের অভিযোজন কৌশল' },
              { en: 'Biodiversity and in-situ / ex-situ conservation', bn: 'জীববৈচিত্র্য ও এর সংরক্ষণ' },
              { en: 'Forest types of Bangladesh (Sundarbans mangrove)', bn: 'বাংলাদেশের বনাঞ্চল ও সুন্দরবন' },
            ]},
          ],
        },
        {
          paper: 2,
          name_en: 'Biology 2nd Paper (Zoology)',
          name_bn: 'জীববিজ্ঞান ২য় পত্র (প্রাণিবিজ্ঞান)',
          chapters: [
            { chapter_no: 1, title_en: 'Animal Diversity and Classification', title_bn: 'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস', topics: [
              { en: 'Bases of classification (Symmetry, Coelom, Germ layers)', bn: 'শ্রেণিবিন্যাসের ভিত্তি (প্রতিসাম্যতা, সিলোম, ভ্রূণস্তর)' },
              { en: 'Characteristics of major non-chordate phyla (Porifera to Echinodermata)', bn: 'নন-কর্ডাটা পর্বসমূহের বৈশিষ্ট্য' },
              { en: 'Phylum Chordata classification and subphyla/classes', bn: 'কর্ডাটা পর্ব ও বিভিন্ন শ্রেণির বৈশিষ্ট্য' },
            ]},
            { chapter_no: 2, title_en: 'Animal Identification', title_bn: 'প্রাণীর পরিচিতি', topics: [
              { en: 'Hydra (Morphology, nematocysts, locomotion, reproduction)', bn: 'হাইড্রা (বাহ্যিক গঠন, নিডোসাইট, চলন, জনন)' },
              { en: 'Grasshopper (Mouthparts, digestive, circulatory, and respiratory systems)', bn: 'ঘাসফড়িং (পৌষ্টিক, রক্ত সংবহন ও শ্বসনতন্ত্র)' },
              { en: 'Rui fish (External morphology, heart structure, circulation, swim bladder)', bn: 'রুই মাছ (বাহ্যিক গঠন, হৃদপিণ্ড, রক্ত সংবহন, পটকা)' },
            ]},
            { chapter_no: 3, title_en: 'Human Physiology: Digestion and Absorption', title_bn: 'মানব শারীরতত্ত্ব: পরিপাক ও শোষণ', topics: [
              { en: 'Digestive tract and associated glands (Liver, Pancreas)', bn: 'পৌষ্টিকনালি ও পৌষ্টিকগ্রন্থি (যকৃৎ, অগ্ন্যাশয়)' },
              { en: 'Digestion of carbohydrates, proteins, and lipids', bn: 'শর্করা, আমিষ ও চর্বি পরিপাক' },
              { en: 'Absorption of digested food materials', bn: 'খাদ্য শোষণ প্রক্রিয়া' },
              { en: 'Gut hormones and regulation of digestion', bn: 'পরিপাকে হরমোনের ভূমিকা' },
            ]},
            { chapter_no: 4, title_en: 'Human Physiology: Blood and Circulation', title_bn: 'মানব শারীরতত্ত্ব: রক্ত ও সংবহন', topics: [
              { en: 'Blood components, blood groups (ABO, Rh system)', bn: 'রক্তের উপাদান, রক্তের গ্রুপ ও আরএইচ ফ্যাক্টর' },
              { en: 'Blood clotting mechanism', bn: 'রক্ত তঞ্চন ক্রিয়া' },
              { en: 'Structure of human heart and cardiac cycle (Systole, Diastole)', bn: 'হৃদপিণ্ডের গঠন ও কার্ডিয়াক চক্র' },
              { en: 'Conducting system of heart (SA node, AV node, Purkinje fibers)', bn: 'হৃদস্পন্দন নিয়ন্ত্রণ (SA নোড, পেসমেকার)' },
              { en: 'Cardiovascular diseases, Angioplasty, and Bypass surgery', bn: 'হৃদরোগ, এনজিওপ্লাস্টি ও বাইপাস সার্জারি' },
            ]},
            { chapter_no: 5, title_en: 'Human Physiology: Respiration', title_bn: 'মানব শারীরতত্ত্ব: শ্বাসক্রিয়া ও শ্বসন', topics: [
              { en: 'Respiratory tract and alveolar structure', bn: 'শ্বসনতন্ত্র ও অ্যালভিওলাসের গঠন' },
              { en: 'Mechanism of breathing (Inspiration and Expiration)', bn: 'প্রশ্বাস-নিঃশ্বাস প্রক্রিয়া' },
              { en: 'Gas transport (Oxygen and Carbon dioxide transport)', bn: 'অক্সিজেন ও কার্বন ডাইঅক্সাইড পরিবহন' },
              { en: 'Respiratory disorders (Asthma, Emphysema, Bronchitis)', bn: 'শ্বসনতন্ত্রের রোগ ও ধূমপানের প্রভাব' },
            ]},
            { chapter_no: 6, title_en: 'Human Physiology: Excretion and Osmoregulation', title_bn: 'মানব শারীরতত্ত্ব: বর্জ্য ও নিষ্কাশন', topics: [
              { en: 'Structure of kidney and microscopic anatomy of Nephron', bn: 'বৃক্ক ও নেফ্রনের সূক্ষ্ম গঠন' },
              { en: 'Mechanism of urine formation (Ultrafiltration, Selective reabsorption)', bn: 'মূত্র উৎপাদন কৌশল' },
              { en: 'Hormonal control of excretion and osmoregulation (ADH, Aldosterone)', bn: 'অসমোরেগুলেশন ও হরমোনের ভূমিকা' },
              { en: 'Renal failure, Hemodialysis, and Peritoneal dialysis', bn: 'বৃক্ক বিকল ও ডায়ালাইসিস পদ্ধতি' },
            ]},
            { chapter_no: 7, title_en: 'Human Physiology: Locomotion and Movement', title_bn: 'মানব শারীরতত্ত্ব: চলন ও অঙ্গচালনা', topics: [
              { en: 'Human skeletal system (Axial and Appendicular skeleton)', bn: 'কঙ্কালতন্ত্র (অক্ষীয় ও উপাঙ্গীয় কঙ্কাল)' },
              { en: 'Bone, cartilage, and synovial joint structure', bn: 'অস্থি, তরুণাস্থি ও সাইনোভিয়াল সন্ধি' },
              { en: 'Sliding filament theory of skeletal muscle contraction', bn: 'পেশি সংকোচনের স্লাইডিং ফিলামেন্ট তত্ত্ব' },
              { en: 'Fractures, sprains, and first aid management', bn: 'অস্থিভঙ্গ ও স্থানচ্যুতি' },
            ]},
            { chapter_no: 8, title_en: 'Human Physiology: Coordination and Control', title_bn: 'মানব শারীরতত্ত্ব: সমন্বয় ও নিয়ন্ত্রণ', topics: [
              { en: 'Central nervous system: Brain regions and cranial nerves', bn: 'কেন্দ্রীয় স্নায়ুতন্ত্র: মস্তিষ্ক ও করোটিক স্নায়ু' },
              { en: 'Neuron structure and nerve impulse conduction', bn: 'নিউরনের গঠন ও উদ্দীপনা পরিবহন' },
              { en: 'Reflex arc', bn: 'প্রতিবর্ত ক্রিয়া ও প্রতিবর্ত চাপ' },
              { en: 'Structure of eye and mechanism of vision', bn: 'চোখের গঠন ও দৃষ্টির ক্রিয়া কৌশল' },
              { en: 'Structure of ear and mechanism of hearing/balance', bn: 'কানের গঠন, শ্রবণ ও ভারসাম্য নিয়ন্ত্রণ' },
              { en: 'Endocrine glands and major hormonal functions', bn: 'অন্তঃক্ষরা গ্রন্থি ও হরমোনের কাজ' },
            ]},
            { chapter_no: 9, title_en: 'Continuity of Human Life', title_bn: 'মানব জীবনের ধারাবাহিকতা', topics: [
              { en: 'Male and female reproductive systems', bn: 'পুং ও স্ত্রী প্রজননতন্ত্রের গঠন' },
              { en: 'Spermatogenesis and Oogenesis', bn: 'শুক্রাণু ও ডিম্বাণু জনন' },
              { en: 'Menstrual cycle and hormonal regulation', bn: 'ঋতুচক্র ও হরমোনের প্রভাব' },
              { en: 'Fertilization, blastocyst formation, and implantation', bn: 'নিষেক ও গর্ভধারণ' },
              { en: 'Embryonic development, placenta function, and organogenesis', bn: 'ভ্রূণের পরিস্ফুটন ও অমরার কাজ' },
            ]},
            { chapter_no: 10, title_en: 'Immunity of Human Body', title_bn: 'মানবদেহের প্রতিরক্ষা', topics: [
              { en: 'Lines of defense (1st, 2nd, and 3rd lines)', bn: 'প্রতিরক্ষার তিনটি স্তর' },
              { en: 'Innate and acquired immunity', bn: 'সহজাত ও অর্জিত প্রতিরক্ষা' },
              { en: 'Antibody structure and antigen-antibody interaction', bn: 'অ্যান্টিবডির গঠন ও কাজ' },
              { en: 'Types of vaccines and immunization', bn: 'টিকা ও টিকাদানের গুরুত্ব' },
            ]},
            { chapter_no: 11, title_en: 'Genetics and Evolution', title_bn: 'জিনতত্ত্ব ও বিবর্তন', topics: [
              { en: "Mendel's first and second laws", bn: 'মেন্ডেলের প্রথম ও দ্বিতীয় সূত্র' },
              { en: "Exceptions to Mendel's laws (Incomplete dominance, Co-dominance, Lethal gene)", bn: 'মেন্ডেল সূত্রের ব্যতিক্রমসমূহ' },
              { en: 'Sex-linked inheritance (Hemophilia, Color blindness, Thalassemia)', bn: 'সেক্স-লিংকড বংশগতি ও রোগসমূহ' },
              { en: 'Theories of evolution (Lamarckism, Darwinism, Neo-Darwinism)', bn: 'বিবর্তন মতবাদ (ল্যামার্কিজম, ডারউইনিজ্ম)' },
            ]},
            { chapter_no: 12, title_en: 'Animal Behavior', title_bn: 'প্রাণীর আচরণ', topics: [
              { en: 'Innate behavior (Orientation, Reflexes, Fixed Action Patterns)', bn: 'সহজাত আচরণ (ট্যাক্সিস, রিফ্লেক্স, এফএপি)' },
              { en: 'Learned behavior (Habituation, Imprinting, Conditioning)', bn: 'শিক্ষালব্ধ আচরণ (অভ্যাসগত, ইমপ্রিন্টিং)' },
              { en: 'Altruism and parental care in animals', bn: 'পরার্থপরতা ও অপত্য যত্ন' },
            ]},
          ],
        },
      ],
    },
    {
      id: 'english',
      name_en: 'English',
      name_bn: 'ইংরেজি',
      papers: [
        {
          paper: 1,
          name_en: 'English 1st Paper',
          name_bn: 'ইংরেজি ১ম পত্র',
          chapters: [
            { chapter_no: 1, title_en: 'Textbook Units (EFT Reading)', title_bn: 'পাঠ্যবইয়ের ইউনিটভিত্তিক প্যাসেজ', topics: [
              { en: 'People or Personalities (Nelson Mandela, Bangabandhu, Kuakata)', bn: 'ঐতিহাসিক ব্যক্তিত্ব ও স্থান' },
              { en: 'Dreams and Aspirations', bn: 'স্বপ্ন ও প্রেরণা' },
              { en: 'Traffic Capital and Road Safety', bn: 'ট্রাফিক নিয়ম ও সড়ক নিরাপত্তা' },
              { en: 'Youthful Encounters and Adolescence', bn: 'কৈশোর ও সামাজিক চ্যালেঞ্জ' },
              { en: 'Art and Music (Folk music, Craftwork)', bn: 'শিল্প, সাহিত্য ও লোকসংস্কৃতি' },
              { en: 'Environment and Nature (Deforestation, Climate change)', bn: 'পরিবেশ ও জলবায়ু পরিবর্তন' },
              { en: 'Tours and Travels', bn: 'ভ্রমণ ও পর্যটন' },
            ]},
            { chapter_no: 2, title_en: 'Reading Skills and Assessment', title_bn: 'পঠন দক্ষতা ও প্রশ্ন মূল্যায়ন', topics: [
              { en: 'Multiple Choice Questions (Contextual vocabulary)', bn: 'বহুনির্বাচনি প্রশ্ন' },
              { en: 'Short Answer Questions', bn: 'সংক্ষিপ্ত উত্তর লিখন' },
              { en: 'Information Transfer and Flow Chart completion', bn: 'তথ্য স্থানান্তর ও ফ্লো চার্ট' },
              { en: 'Summary Writing', bn: 'সারসংক্ষেপ লিখন' },
              { en: 'Theme Writing from Poems', bn: 'কবিতার মূলভাব লিখন' },
              { en: 'Cloze test with clues and without clues', bn: 'শূন্যস্থান পূরণ (ক্লু সহ ও ছাড়া)' },
              { en: 'Rearranging sentences into a coherent story', bn: 'বাক্য পুনর্বিন্যাস (রি-অ্যারেঞ্জ)' },
            ]},
            { chapter_no: 3, title_en: 'Guided Writing', title_bn: 'লিখিত অংশ', topics: [
              { en: 'Descriptive and Narrative Paragraph Writing', bn: 'বর্ণনামূলক অনুচ্ছেদ' },
              { en: 'Completing a given incomplete story', bn: 'অসমাপ্ত গল্প পূরণ' },
              { en: 'Informal Letter and Email writing', bn: 'ব্যক্তিগত চিঠি ও ইমেইল' },
              { en: 'Analyzing Graphs and Charts', bn: 'গ্রাফ ও চার্ট বিশ্লেষণ' },
            ]},
          ],
        },
        {
          paper: 2,
          name_en: 'English 2nd Paper',
          name_bn: 'ইংরেজি ২য় পত্র',
          chapters: [
            { chapter_no: 1, title_en: 'Applied Grammar', title_bn: 'ব্যবহারিক ব্যাকরণ', topics: [
              { en: 'Gap filling activities with Prepositions', bn: 'প্রেপোজিশনের সঠিক ব্যবহার' },
              { en: 'Special phrases/words (was born, have to, would rather, as soon as, what if)', bn: 'বিশেষ বাক্যাংশের ব্যবহার' },
              { en: 'Completing sentences (Conditionals, Subjunctive, Conjunctions)', bn: 'শর্তযুক্ত ও অসম্পূর্ণ বাক্য পূরণ' },
              { en: 'Right form of verbs and Subject-Verb Agreement', bn: 'ক্রিয়ার সঠিক রূপ ও সাবজেক্ট-ভার্ব একর্ড' },
              { en: 'Narrative style (Direct to Indirect Speech)', bn: 'উক্তি পরিবর্তন (ন্যারেশন)' },
              { en: 'Use of Modifiers (Pre-modifiers and Post-modifiers)', bn: 'মডিফায়ারের সঠিক প্রয়োগ' },
              { en: 'Sentence Connectors and Linking words', bn: 'সেন্টেন্স কানেক্টরস ও লিঙ্কার্স' },
              { en: 'Synonyms and Antonyms in contextual sentences', bn: 'সমার্থক ও বিপরীতার্থক শব্দ' },
              { en: 'Punctuation and Capitalization rules', bn: 'বিরামচিহ্ন ও ক্যাপিটালাইজেশন' },
            ]},
            { chapter_no: 2, title_en: 'Composition', title_bn: 'রচনামূলক অংশ', topics: [
              { en: 'Formal letters, Applications, and Complaint letters', bn: 'আবেদনপত্র ও প্রাতিষ্ঠানিক পত্র' },
              { en: 'Paragraph by listing and description', bn: 'তালিকা ও বিবরণমূলক অনুচ্ছেদ' },
              { en: 'Paragraph by cause and effect / comparison and contrast', bn: 'কারণ-ফলাফল ও তুলনামূলক অনুচ্ছেদ' },
            ]},
          ],
        },
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// TOGGLE PREFERENCE (picker mode vs. free-text mode) — persisted per device
// ----------------------------------------------------------------------------
const MODE_KEY = 'campus_topic_picker_mode';
export type TopicPickerMode = 'syllabus' | 'free';

export const getTopicPickerMode = (): TopicPickerMode => {
  try {
    const v = localStorage.getItem(MODE_KEY);
    return v === 'free' ? 'free' : 'syllabus'; // default = syllabus picker
  } catch {
    return 'syllabus';
  }
};

export const setTopicPickerMode = (mode: TopicPickerMode) => {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    /* ignore */
  }
};

// ----------------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------------

/** Build a human-readable label like "Physics · Ch 2: Vectors · Dot product" */
export const buildTopicLabel = (
  subject: SyllabusSubject,
  paper: SyllabusPaper,
  chapter: SyllabusChapter,
  topic: SyllabusTopic
): string =>
  `${subject.name_en} · ${paper.name_en} · Ch ${chapter.chapter_no}: ${chapter.title_en} · ${topic.en}`;

/** Short label for the timer display / leaderboard tag */
export const buildShortTopicLabel = (
  subject: SyllabusSubject,
  chapter: SyllabusChapter,
  topic: SyllabusTopic
): string => `${subject.name_en} · ${topic.en}`;
// ----------------------------------------------------------------------------
// LANGUAGE-AWARE HELPERS
// ----------------------------------------------------------------------------

export type SyllabusLang = 'bn' | 'en' | 'both';

/** Read the app language from localStorage, default Bengali */
export const getSyllabusLang = (): SyllabusLang => {
  try {
    const raw = localStorage.getItem('campus6_user_profile');
    if (raw) {
      const p = JSON.parse(raw);
      const lang = p?.preferredLanguage;
      if (lang === 'en') return 'en';
      if (lang === 'both') return 'both';
      return 'bn';
    }
  } catch {
    /* fall through */
  }
  return 'bn'; // default = Bengali
};

/** Subject display name by language */
export const subjectName = (s: SyllabusSubject, lang: SyllabusLang): string =>
  lang === 'en' ? s.name_en : lang === 'both' ? `${s.name_bn} (${s.name_en})` : s.name_bn;

/** Paper display name by language */
export const paperName = (p: SyllabusPaper, lang: SyllabusLang): string =>
  lang === 'en' ? p.name_en : lang === 'both' ? `${p.name_bn} (${p.name_en})` : p.name_bn;

/** Chapter title by language */
export const chapterTitle = (c: SyllabusChapter, lang: SyllabusLang): string =>
  lang === 'en' ? c.title_en : lang === 'both' ? `${c.title_bn} (${c.title_en})` : c.title_bn;

/** Topic label by language (used for the list AND the saved timer topic) */
export const topicLabel = (t: SyllabusTopic, lang: SyllabusLang): string =>
  lang === 'en' ? t.en : lang === 'both' ? `${t.bn} (${t.en})` : t.bn;
/**
 * Backward-compatible alias — older files (e.g. CustomMissionBuilder.tsx)
 * import the syllabus as `hscFullSyllabus`. Keep both names working.
 */
export const hscFullSyllabus = HSC_SYLLABUS;