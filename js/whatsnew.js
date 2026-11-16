// =====================================================================
//  «Τι νέο υπάρχει» — εμφανίζεται μία φορά σε όλη την ομάδα μετά από
//  κάθε ενημέρωση. Για νέα έκδοση: προσθέστε μια εγγραφή στην αρχή του RELEASES.
//  4ο στοιχείο 'admin' = το βλέπουν μόνο οι διαχειριστές.
// =====================================================================
import { L, esc, icon, sheet } from './core.js';
import { S, isAdmin } from './data.js';
import { pageHead } from './layout.js';

export const RELEASES = [
  {
    v: '1.18.3', date: '16/11/2026',
    items: [
      ['💍', 'Ηλεκτρονική προσφορά γάμου και γαμοβάπτισης: όπως και στη βάπτιση, ο πελάτης συμπληρώνει πρώτα τα στοιχεία και μετά βλέπει το βασικό πακέτο, τις επιλογές και τη σύνοψη.', 'Online wedding and wedding & christening offer: as with christenings, the client first fills in the details, then sees the basic package, options and summary.', 'admin'],
    ],
  },
  {
    v: '1.18.2', date: '16/11/2026',
    items: [
      ['➖', 'Αρχική: τα ολοκληρωμένα task εμφανίζονται διαγραμμένα με μια οριζόντια γραμμή, όπως και στο ημερολόγιο.', 'Home: completed tasks are shown struck through with a horizontal line, as in the calendar.'],
    ],
  },
  {
    v: '1.18.1', date: '16/11/2026',
    items: [
      ['👆', 'Αρχική: στη μικρή λίστα κάτω από την ημερομηνία πατήστε «1 ραντεβού», τον τίτλο ενός task ή «1 εκδήλωση» και ανοίγουν κατευθείαν οι λεπτομέρειες. Αν είναι περισσότερα, διαλέγετε από μια λίστα.', 'Home: in the small list under the date, tap “1 appointment”, a task title or “1 event” to open its details straight away. If there are several, pick from a list.'],
    ],
  },
  {
    v: '1.18.0', date: '16/11/2026',
    items: [
      ['🏠', 'Αρχική: κάτω από την ημερομηνία, μια μικρή λίστα — τι έχετε σήμερα, τα task που είναι για εσάς και πόσες εκδηλώσεις έχει η εβδομάδα. Φαίνεται πλέον και στο κινητό.', 'Home: under the date, a small list — what you have today, the tasks that are for you and how many events this week has. Now on phones too.'],
      ['📷', 'Κατάσταση φωτογραφιών: νέο στάδιο «Να σταλθούν τα δείγματα», ανάμεσα στο «Να γίνουν δείγματα» και στο «Έλαβαν δείγματα και περιμένουμε».', 'Photos status: new stage “Samples to be sent”, between “Samples to be made” and “Client has samples – waiting”.'],
      ['🕊️', 'Ηλεκτρονική προσφορά βάπτισης: ο πελάτης συμπληρώνει πρώτα τα στοιχεία της βάπτισης και μετά βλέπει το βασικό πακέτο, τις επιλογές και τη σύνοψη.', 'Online christening offer: the client first fills in the christening details, then sees the basic package, options and summary.', 'admin'],
    ],
  },
  {
    v: '1.17.0', date: '16/11/2026',
    items: [
      ['📋', 'Ημερολόγιο: νέα επιλογή «Task» στο «+». Γράφετε τι πρέπει να γίνει, για πότε και για ποιο άτομο (ώρα, τοποθεσία και σημειώσεις προαιρετικά). Το άτομο παίρνει ειδοποίηση στο κινητό (ακόμη κι αν το task είναι για τον εαυτό σας) και βλέπει πάντα το task του.', 'Calendar: new “Task” option under “+”. Write what needs doing, when and for whom (time, location and notes optional). That person is notified and always sees their task.'],
      ['✅', 'Όταν τελειώσετε ένα task, πατήστε το και «Ολοκληρώθηκε». Γίνεται ✅ και διαγραμμένο, και όποιος το έφτιαξε παίρνει ειδοποίηση.', 'When you finish a task, tap it and choose “Done”. It turns ✅ and struck through, and whoever created it is notified.'],
      ['🧾', 'Προσφορές: η φόρμα ραντεβού έχει μόνο τον «Οδηγό προσφοράς» (το έτοιμο PDF ανεβαίνει μέσα από το ραντεβού). Χωρίς χρονολογίες στις σελίδες· γράφουν απλά «Wedding Package», «Christening Package», «Wedding & Christening Package».', 'Offers: the appointment form has only the “Offer wizard” (a ready PDF is uploaded from inside the appointment). No years on the pages; they simply say “Wedding Package”, “Christening Package”, “Wedding & Christening Package”.', 'admin'],
      ['💬', 'Νέο, πιο επαγγελματικό μήνυμα για την αποστολή του προσωπικού link στον πελάτη, και σαφές μήνυμα στον πελάτη αν ξεχάσει το κουτάκι της συγκατάθεσης.', 'A new, more professional message for sending the personal link, and a clear prompt if the client forgets the consent box.', 'admin'],
      ['🔄', 'Όταν ο πελάτης αλλάξει επιλογές από το σπίτι, το ραντεβού δείχνει καθαρά τι πρόσθεσε, τι αφαίρεσε, την τιμή πριν και μετά, και τι είχατε συμφωνήσει στο στούντιο.', 'When the client changes choices from home, the appointment clearly shows what was added or removed, the price before and after, and what you agreed in the studio.', 'admin'],
      ['✨', 'Από εδώ και πέρα, μετά από κάθε ενημέρωση εμφανίζεται σε όλη την ομάδα αυτό το παράθυρο με ό,τι νέο υπάρχει (στον καθένα ό,τι τον αφορά).', 'From now on, after every update the whole team sees this window with what’s new (each person what concerns them).'],
    ],
  },
  {
    v: '1.16.0', date: '15/11/2026',
    items: [
      ['💶', 'Έσοδα & Έξοδα: πιο φιλική εμφάνιση — καθαρότερα σύνολα, μήνες που ανοίγουν/κλείνουν και πιο ευανάγνωστες κινήσεις. Η λειτουργία έμεινε ίδια.', 'Income & Expenses: friendlier look — clearer totals, collapsible months and easier-to-read entries. It works the same way.', 'admin'],
      ['🔗', 'Ραντεβού: αποστολή link ηλεκτρονικής προσφοράς ανά κατηγορία (γάμος, βάπτιση, γαμοβάπτιση).', 'Appointments: send an online offer link per category (wedding, christening, wedding & christening).', 'admin'],
      ['👤', 'Προσωπικό link προσφοράς: ο πελάτης βλέπει την προσφορά που φτιάξατε μαζί στο στούντιο, την αλλάζει από το σπίτι και οι αλλαγές έρχονται κατευθείαν στο ραντεβού. Δίπλα στο κουμπί φαίνεται ✓ όταν έχει σταλεί.', 'Personal offer link: the client sees the offer you built together in the studio, changes it from home and the changes go straight to the appointment. A ✓ shows next to the button once it has been sent.', 'admin'],
    ],
  },
  {
    v: '1.15.2', date: '15/11/2026',
    items: [
      ['🏠', 'Αρχική και καρτέλα εκδήλωσης: γράφει «σε 5 ημέρες» αντί για «5 ημέρες ακόμη». Το Ταμείο του μήνα δείχνει δίπλα-δίπλα εισπράξεις (πράσινο) και έξοδα (κόκκινο) και από κάτω τα καθαρά. Έφυγε το υπόμνημα χρωμάτων κάτω από την εβδομάδα.', 'Home: the next event says “in 5 days”. Month cash shows income (green) and expenses (red) side by side with net below. The colour legend under the week is gone.'],
      ['🗂️', 'Κατάσταση εργασιών: ανοίγει πάντα στο «Όλες», έχει στήλη Κατηγορία, και οι εκδηλώσεις που ολοκληρώθηκαν (φωτογραφίες παραδόθηκαν και βίντεο έτοιμο) φαίνονται πράσινες.', 'Work status: always opens on “All”, has a Category column, and completed events (photos delivered and video ready) show in green.'],
    ],
  },
  {
    v: '1.15.1', date: '15/11/2026',
    items: [
      ['📌', 'Φύλλα: ο Μήνας, η Ημερομηνία και η Τοποθεσία μένουν πάντα καρφιτσωμένα αριστερά όταν σύρετε τον πίνακα δεξιά (στο κινητό μόνο ο Μήνας, για να χωράει η οθόνη).', 'Sheets: Month, Date and Location stay pinned on the left when you scroll right (on phones only Month, to fit the screen).'],
    ],
  },
  {
    v: '1.15.0', date: '15/11/2026',
    items: [
      ['🔽', 'Φύλλα (Image Makers, Πελάτες, Πληρωμές, Φωτογραφίες & editing): φίλτρα όπως στο Excel στις στήλες Μήνας, Κατηγορία Εκδήλωσης, Ανάλυση, Κατάσταση Φωτογραφίες, Κατάσταση Editing και Εξόφληση OK. Αντικαθιστούν τις παλιές λίστες «Όλοι οι μήνες / Όλες οι κατηγορίες».', 'Sheets (Image Makers, Clients, Payments, Photos & editing): Excel-style filters on Month, Event category, Resolution, Photos status and Editing status. They replace the old “All months / All categories” lists.'],
      ['🧹', 'Αφαιρέθηκαν τα κουμπιά «Μόνο ανεξόφλητα» και «Με ακυρωμένες». Για τα ανεξόφλητα υπάρχει φίλτρο στη στήλη «Εξόφληση OK»· οι ακυρωμένες εκδηλώσεις φαίνονται στη λίστα Εκδηλώσεις.', 'Removed the “Unpaid only” and “Include cancelled” buttons. For unpaid use the “Paid OK” column filter; cancelled events are in the Events list.'],
      ['📅', 'Πρώτη στήλη ο Μήνας και μετά η Ημερομηνία.', 'Month is now the first column, then the Date.'],
      ['✨', 'Οι καρτέλες των φύλλων χωράνε σε μία γραμμή και τα κουμπιά ενοτήτων (Βασικά, Ζευγάρι, …) είναι πιο ελαφριά.', 'Sheet tabs fit on one line and the section buttons (Basics, Couple, …) are lighter.'],
    ],
  },
  {
    v: '1.14.0', date: '15/11/2026',
    items: [
      ['🔽', 'Φύλλο Dimitris: φίλτρα όπως στο Excel! Δίπλα σε κάθε επικεφαλίδα υπάρχει ένα βελάκι — πατήστε το για ταξινόμηση ή για να διαλέξετε με τικ ποιες τιμές θα φαίνονται (π.χ. μόνο κάποιους μήνες ή μόνο «υπό επεξεργασία»). Πάνω από τον πίνακα φαίνεται ποια φίλτρα είναι ενεργά, με κουμπί «Καθαρισμός όλων».', 'Dimitris sheet: Excel-style filters! Each header has a small arrow — tap it to sort or tick which values to show (e.g. only some months or only “in progress”). Active filters are shown above the table with a “Clear all” button.'],
      ['🎬', 'Φύλλο Dimitris: πιο συμπτυγμένο — στενότερες στήλες και χαμηλότερες γραμμές, ώστε να χωράνε περισσότερα στην οθόνη χωρίς σκρολάρισμα.', 'Dimitris sheet: more compact — narrower columns and shorter rows, so more fits on screen without scrolling.'],
    ],
  },
  {
    v: '1.13.2', date: '15/11/2026',
    items: [
      ['📱', 'Κινητό: η εβδομάδα στην Αρχική είναι πιο μαζεμένη — οι συνεχόμενες ελεύθερες μέρες γίνονται μία γραμμή (π.χ. «Πεμ 19 – Κυρ 22 · ελεύθερες») και μια άδεια εβδομάδα δείχνει μόνο ένα μήνυμα.', 'Phone: the week on Home is more compact — consecutive free days become one line (e.g. “Thu 19 – Sun 22 · free”) and an empty week shows just one message.'],
    ],
  },
  {
    v: '1.13.1', date: '15/11/2026',
    items: [
      ['🗓️', 'Αρχική: η εβδομάδα με ώρες είναι πιο μικρή — ξεκινά από την πρώτη ώρα που έχει κάτι και σταματά εκεί που τελειώνει το τελευταίο. Μια άδεια εβδομάδα δείχνει μόνο ένα χαμηλό πλαίσιο.', 'Home: the hourly week is more compact — it starts at the first hour with something and stops where the last item ends. An empty week shows just a short frame.'],
      ['🧹', 'Την Κυριακή δεν εμφανίζεται πλέον αυτόματα και η επόμενη εβδομάδα από κάτω (τη βλέπετε με το βελάκι ›).', 'On Sundays the next week no longer appears automatically below (use the › arrow).'],
    ],
  },
  {
    v: '1.13.0', date: '15/11/2026',
    items: [
      ['📋', 'Νέα καρτέλα εκδήλωσης: πιο συμμαζεμένη, με κάθε ενότητα σε δικό της κουτί. Στον υπολογιστή σε δύο στήλες — αριστερά τι γίνεται (τοποθεσίες, συνεργείο, Next day, πακέτο, σημειώσεις), δεξιά πελάτης, οικονομικά, παραγωγή και ενέργειες.', 'New event page: tidier, each section in its own box. On computers in two columns — on the left what happens (locations, crew, Next day, package, notes), on the right client, finances, production and actions.'],
      ['👥', 'Το συνεργείο και τα κείμενα ανάθεσης είναι πλέον μαζί: κάθε μέλος σε μία γραμμή με την αρμοδιότητά του και το κείμενό του (πατήστε το κείμενο για να το δείτε ολόκληρο).', 'Crew and assignment notes are now together: each member on one line with their duty and note (tap the note to see all of it).'],
      ['📱', 'Στο κινητό ο πελάτης εμφανίζεται αμέσως μετά το συνεργείο και τα κουμπιά επάνω (Κλήση, SMS, Χάρτης…) είναι πιο μικρά και τακτοποιημένα.', 'On phones the client appears right after the crew, and the buttons on top (Call, SMS, Map…) are smaller and tidier.'],
    ],
  },
  {
    v: '1.12.0', date: '15/11/2026',
    items: [
      ['🗓️', 'Αρχική (υπολογιστής): η εβδομάδα εμφανίζεται πλέον με ώρες — μία στήλη για κάθε μέρα και κάθε υπόθεση ένα χρωματιστό μπλοκ στην ώρα της. Ό,τι δεν έχει ώρα (π.χ. απουσίες) μπαίνει στη γραμμή «όλη μέρα» επάνω. Μια κόκκινη γραμμή δείχνει την τρέχουσα ώρα.', 'Home (computer): the week now shows with hours — one column per day and each item as a coloured block at its time. Items without a time (e.g. absences) go in the “all day” row on top. A red line marks the current time.'],
      ['📱', 'Στο κινητό η εβδομάδα μένει ως λίστα ανά ημέρα, που διαβάζεται πιο εύκολα σε μικρή οθόνη.', 'On phones the week stays as a list per day, easier to read on a small screen.'],
    ],
  },
  {
    v: '1.11.1', date: '15/11/2026',
    items: [
      ['📅', 'Αρχική: η εβδομάδα εμφανίζεται πλέον ως κάρτες ανά ημέρα, με όλες τις λεπτομέρειες (τι, ποιος, ώρα). Οι ημέρες που πέρασαν δεν εμφανίζονται.', 'Home: the week now shows as one card per day with all details (what, who, time). Past days are hidden.'],
      ['📱', 'Διόρθωση: στο κινητό το «ημέρες ακόμη» δεν πέφτει πλέον πάνω στον τίτλο της επόμενης εκδήλωσης.', 'Fix: on phones, “days to go” no longer covers the next event’s title.'],
    ],
  },
  {
    v: '1.11.0', date: '15/11/2026',
    items: [
      ['🏠', 'Νέα Αρχική! Επόμενη εκδήλωση και «Σήμερα» δίπλα δίπλα, η εβδομάδα από Δευτέρα έως Κυριακή (την Κυριακή και η επόμενη από κάτω), «Χρειάζονται προσοχή» με εξήγηση σε κάθε γραμμή, «Ταμείο μήνα» και «Η χρονιά με μια ματιά».', 'New Home! Next event and “Today” side by side, the week from Monday to Sunday (on Sundays the next week too), “Needs attention” with a short explanation, “Cash this month” and “The year at a glance”.'],
      ['🚫', 'Οι απουσίες φαίνονται πλέον με απαγορευτικό εικονίδιο και κόκκινο χρώμα στην Αρχική.', 'Absences now show with a “no entry” icon in red on Home.'],
    ],
  },
  {
    v: '1.10.0', date: '15/11/2026',
    items: [
      ['💡', 'Φύλλα (Dimitris, Μητρώο Εισπράξεων): οι οδηγίες δεν πιάνουν πλέον χώρο πάνω πάνω. Ανοίγουν από το κουμπί «Οδηγίες», δίπλα στο «Excel».', 'Sheets (Dimitris, Receipts register): the instructions no longer take space at the top. Open them with the “Help” button next to “Excel”.'],
      ['🔎', 'Ομάδα → Ιστορικό ασφαλείας: νέο φίλτρο «Από:» για να βλέπετε τι έκανε κάθε μέλος. Όλες οι ενέργειες εμφανίζονται πλέον στα ελληνικά.', 'Team → Security history: new “By:” filter to see what each member did. All actions are now shown with proper names.'],
    ],
  },
  {
    v: '1.9.9', date: '12/11/2026',
    items: [
      ['↔️', 'Φύλλα (Excel): η μπάρα για κύλιση δεξιά-αριστερά φαίνεται πλέον πάντα, και σε υπολογιστές με μικρότερη οθόνη: όταν ο πίνακας δεν χωράει, εμφανίζεται στο κάτω μέρος της οθόνης. Έγινε και πιο φαρδιά, για να πιάνεται εύκολα με το ποντίκι.', 'Sheets (Excel): the left-right scroll bar is now always visible, also on computers with smaller screens: when the table does not fit, it appears at the bottom of the screen. It is also wider, so it is easy to grab with the mouse.'],
    ],
  },
  {
    v: '1.9.8', date: '12/11/2026',
    items: [
      ['🤖', 'Η εφαρμογή αναπτύσσεται και συντηρείται πλέον από την Image Makers με τη βοήθεια του Claude (Anthropic).', 'The app is now developed and maintained by Image Makers with the help of Claude (Anthropic).'],
      ['📄', 'Ενημερώθηκαν οι όροι χρήσης και η πολιτική απορρήτου (έκδοση 1.2).', 'The terms of use and privacy policy were updated (version 1.2).'],
    ],
  },
  {
    v: '1.9.7', date: '12/11/2026',
    items: [
      ['📊', 'Κατάσταση Εργασιών: νέο κουμπί «Σύνοψη» δίπλα στο «Όλες». Ανοίγει δύο πίνακες δίπλα δίπλα, έναν για τις φωτογραφίες και έναν για το video, με πόσες εκδηλώσεις είναι σε κάθε στάδιο, το ποσοστό τους και (στις φωτογραφίες) πόσες έχουν πορτοκαλί ή κόκκινη καθυστέρηση. Ακολουθεί τη χρονιά και τον μήνα που έχετε επιλέξει. Πατώντας μια γραμμή εμφανίζονται από κάτω αυτές οι εκδηλώσεις.', 'Work status: new “Summary” button next to “All”. It opens two tables side by side, one for photos and one for video, showing how many events are in each stage, their percentage and (for photos) how many are orange or red. It follows the selected year and month. Tap a row to list those events below.'],
    ],
  },
  {
    v: '1.9.5', date: '10/11/2026',
    items: [
      ['✉️', 'Τα μηνύματα προς πελάτες παίρνουν πλέον πάντα τα τρέχοντα στοιχεία του πελάτη και της εκδήλωσης, και έγιναν διορθώσεις σφαλμάτων.', 'Messages to clients now always use the current client and event details, plus bug fixes.'],
    ],
  },
  {
    v: '1.9.4', date: '06/11/2026',
    items: [
      ['📄', 'Ενημερώθηκαν οι όροι χρήσης και η πολιτική απορρήτου, και έγιναν βελτιώσεις και διορθώσεις σφαλμάτων.', 'The terms of use and privacy policy were updated, plus improvements and bug fixes.'],
    ],
  },
  {
    v: '1.9.3', date: '06/11/2026',
    items: [
      ['🛠️', 'Βελτιώσεις στην πρώτη είσοδο και στην ενεργοποίηση των ειδοποιήσεων, και διορθώσεις σφαλμάτων.', 'Improvements to first sign-in and turning on notifications, and bug fixes.'],
    ],
  },
  {
    v: '1.9.2', date: '05/11/2026',
    items: [
      ['🗄️', 'Βελτιώσεις στα αντίγραφα ασφαλείας και στην επαναφορά δεδομένων, και διορθώσεις σφαλμάτων.', 'Improvements to backups and data restore, and bug fixes.'],
    ],
  },
  {
    v: '1.9.1', date: '05/11/2026',
    items: [
      ['🛠️', 'Διορθώσεις σφαλμάτων και βελτιώσεις σε ταχύτητα, σταθερότητα και ασφάλεια.', 'Bug fixes and improvements to speed, stability and security.'],
    ],
  },
  {
    v: '1.9', date: '05/11/2026',
    items: [
      ['💍', 'Νέα φόρμα προσφοράς για Γάμο (με αριθμό μικρών album και κόστος μετακίνησης) και καινούρια προσφορά για Γαμοβάπτιση, που δουλεύει όπως οι υπόλοιπες: από το ραντεβού, το link και την εκδήλωση, με PDF.', 'New Wedding offer form (with number of small albums and travel cost) and a new Wedding + Baptism offer that works like the others: from the appointment, the link and the event, with PDF.'],
      ['❔', 'Ημερολόγιο: κάθε προσφορά σε αναμονή απάντησης με ημερομηνία εκδήλωσης εμφανίζεται ως «Ενδεχόμενη εκδήλωση» (διακεκομμένη) με τοποθεσία και ώρα. Πατώντας την ανοίγουν οι λεπτομέρειες και το πακέτο. Φεύγει μόλις γίνει confirm ή reject.', 'Calendar: every offer waiting for an answer with an event date shows as a “Possible event” (dashed) with place and time. Tap it for the details and package. It disappears once confirmed or rejected.'],
      ['📆', 'Στο ραντεβού, μόλις μπει η ημερομηνία εκδήλωσης, φαίνεται αμέσως αν υπάρχει ήδη εκδήλωση ή άλλη προσφορά σε αναμονή την ίδια μέρα.', 'In an appointment, as soon as the event date is set you see whether there is already an event or another pending offer on that day.'],
      ['🌤️', 'Αρχική: στην επόμενη εκδήλωση φαίνεται ο καιρός για την περιοχή, την ημέρα και την ώρα της (από 16 ημέρες πριν).', 'Home: the next event shows the weather for its area, day and time (from 16 days before).'],
      ['🖱️', 'Φύλλα (Excel): με το ποντίκι πάνω στο φύλλο, όταν αυτό τελειώσει, η ροδέλα κυλάει πλέον όλη τη σελίδα.', 'Sheets (Excel): with the mouse over a sheet, once it reaches its end the wheel now scrolls the whole page.'],
    ],
  },
  {
    v: '1.8', date: '04/11/2026',
    items: [
      ['📅', 'Επιλογή χρονιάς πάνω δεξιά στα Ημερολόγιο, Εκδηλώσεις, Προσφορές / Ραντεβού, Κατάσταση Εργασιών, Έσοδα & Έξοδα και Φύλλα (Excel). Κάθε tab δείχνει μόνο ό,τι αφορά τη χρονιά και εμφανίζονται μόνο χρονιές που έχουν δεδομένα.', 'Year picker at the top right of Calendar, Events, Offers / Appointments, Work status, Income & Expenses and Sheets. Each tab shows only that year, and only years with data are listed.'],
      ['🤝', 'Προσφορές / Ραντεβού: «Δια ζώσης» αντί για «Παρουσίαση στο μαγαζί», χωρίς το ποσοστό κλεισίματος στις κάρτες· τα confirmed / rejected / σε αναμονή ανοίγουν με βελάκι. Η λίστα ραντεβού είναι κρυμμένη και εμφανίζεται με το ματάκι.', 'Offers / Appointments: “In person” instead of “In-store presentation”, no win rate on the cards; confirmed / rejected / pending open with an arrow. The appointment list is hidden and shown with the eye.'],
      ['🎬', 'Η «Κατάσταση editing» του μεγάλου Excel ακολουθεί πλέον την «Κατάσταση Βίντεο» του Dimitris (υπό επεξεργασία / export / έτοιμο → «Σε επεξεργασία», έτοιμο και παραδόθηκε στο μαγαζί → «Ολοκληρώθηκε»). Αν κάτι γυρίσει πίσω, όλα διορθώνονται αυτόματα. Η «Προτεραιότητα» δείχνει μόνο SOS ή «Να γίνει».', 'The main Excel “Editing status” now follows the Dimitris “Video status” (in progress / export / ready → “In progress”, ready and delivered to the shop → “Done”). If something is set back, everything follows automatically. “Priority” shows only SOS or “To do”.'],
      ['🗂️', 'Κατάσταση Εργασιών: φίλτρα για Μήνα, Κατάσταση Φωτογραφιών και Κατάσταση Video, ο Μήνας πρώτα. Το Video εδώ είναι το ίδιο με το φύλλο Dimitris.', 'Work status: filters for Month, Photos status and Video status, Month first. Video here is the same as the Dimitris sheet.'],
      ['📊', 'Φύλλα: το Κεντρικό λέγεται «Image Makers», έφυγε η στήλη «Υπολογιστής μοντάζ», οι πίνακες χωράνε στο παράθυρο (φαίνεται η μπάρα κύλισης) και στο Dimitris τα «Περασμένα αρχεία» είναι πριν από την Κατάσταση Βίντεο. Σύνοψη: μόνο «Εισπραχθέντα».', 'Sheets: Main is now “Image Makers”, the “Editing computer” column was removed, tables fit the window (scroll bar visible) and in Dimitris “Files copied” comes before Video status. Summary: only “Collected”.'],
      ['💶', 'Έσοδα & Έξοδα: τα κουμπιά Μητρώο / Φύλλο Εξόδων / Dashboard πάνω, μήνες που ανοίγουν με βελάκι (ανοιχτός ο τρέχων), φίλτρα εσόδων (προκαταβολές, 1η / 2η δόση…, κατηγορία, τρόπος) και εξόδων (είδος, υποκατηγορία, μέλος, προμηθευτής, τρόπος). Το «Πληρωμένος μέχρι και» είναι προαιρετικό.', 'Income & Expenses: Register / Expenses sheet / Dashboard buttons on top, months that open with an arrow (current one open), income filters (deposits, 1st / 2nd installment…, category, method) and expense filters (type, subcategory, member, supplier, method). “Paid up to” is optional.'],
      ['✉️', 'Μηνύματα προς πελάτες: όσα αφορούσαν εκδηλώσεις του 2026 και παλιότερα σημειώθηκαν ως απεσταλμένα και πέρασαν στο Ιστορικό.', 'Client messages: those for 2026 and earlier events were marked as sent and moved to History.'],
    ],
  },
  {
    v: '1.7.6', date: '03/11/2026',
    items: [
      ['🔎', 'Next day / Ευχολόγιο: η επιλογή εκδήλωσης δείχνει πλέον μόνο τις εκδηλώσεις των τελευταίων και των επόμενων 2 εβδομάδων και έχει αναζήτηση (όνομα, τοποθεσία, ημερομηνία) για όλες τις υπόλοιπες.', 'Next day / Blessing: the event picker now shows only the events of the last and next 2 weeks, with a search (name, place, date) for all others.'],
      ['🚫', 'Γάμοι που στον Οδηγό προσφοράς αφαιρέθηκε όλο το next day (φωτογράφηση, video και drone next day) δεν εμφανίζονται στην επιλογή εκδήλωσης για Next day / Ευχολόγιο.', 'Weddings whose offer removed the whole next day (photo, video and drone next day) no longer appear in the Next day / Blessing event picker.'],
      ['📊', 'Έσοδα & Έξοδα: νέα καρτέλα «Στατιστικά» πάνω πάνω, με έσοδα & έξοδα ανά μήνα, ανά κατηγορία, μεροκάματα και μισθοδοσία.', 'Income & Expenses: new “Statistics” tab at the top, with income & expenses by month, by category, daily wages and payroll.'],
      ['🔍', 'Ημερολόγιο: διπλό πάτημα σε μια ημέρα την ανοίγει σε μεγέθυνση (προβολή «Ημέρα») για να δείτε τι έχει· δεν ανοίγει πλέον νέα εκδήλωση. Νέα εκδήλωση μπαίνει από το «+».', 'Calendar: double-tapping a day zooms into it (Day view) to see what it has; it no longer opens a new event. New events go through “+”.'],
      ['🧹', 'Excel: αφαιρέθηκε η στήλη «Έως (πολυήμερη)». Οι διακόπτες (π.χ. «Δεύτερο συνεργείο») ενεργοποιούνται μόνο πατώντας πάνω τους ή στο κείμενό τους.', 'Excel: the “Until (multi-day)” column was removed. Switches (e.g. “Second crew”) now only toggle when tapping them or their text.'],
    ],
  },
  {
    v: '1.7.5', date: '02/11/2026',
    items: [
      ['👥', 'Βάπτιση: στο βήμα «Συνεργείο» δεν υπάρχει πλέον επιλογή μονού / διπλού συνεργείου· η βάπτιση έχει πάντα 1 συνεργείο.', 'Baptism: the “Crew” step no longer offers single / double crew; a baptism always has 1 crew.'],
      ['🚁', 'Συνεργείο: το Drone έγινε κουμπί «+ Drone» δίπλα σε Φωτο / Βίντεο, ώστε κάποιος να κάνει π.χ. Βίντεο + Drone.', 'Crew: Drone is now a “+ Drone” button next to Photo / Video, so someone can do e.g. Video + Drone.'],
      ['⛪', 'Νέα βάπτιση: αφαιρέθηκε το πεδίο «Χώρος δεξίωσης».', 'New baptism: the “Reception venue” field was removed.'],
      ['🚫', 'Δήλωση απουσίας: αφαιρέθηκε η λίστα «Επόμενες απουσίες» από τη φόρμα (οι απουσίες φαίνονται στο ημερολόγιο).', 'Declare absence: the “Upcoming absences” list was removed from the form (absences show in the calendar).'],
      ['🔽', 'Προσφορές / Ραντεβού: τα φίλτρα μαζεύτηκαν σε ένα dropdown δίπλα στην αναζήτηση.', 'Offers / Appointments: the filters are now one dropdown next to the search.'],
    ],
  },
  {
    v: '1.7.4', date: '02/11/2026',
    items: [
      ['🔎', 'Χάρτης (pin): νέα αναζήτηση. Γράψτε εκκλησία, κτήμα, διεύθυνση ή χωριό και διαλέξτε από τα αποτελέσματα· το pin μπαίνει μόνο του και μπορείτε να το σύρετε για διόρθωση. Αν έχετε ήδη γράψει την τοποθεσία στην εκδήλωση, η αναζήτηση γίνεται αυτόματα. Δέχεται και συντεταγμένες ή σύνδεσμο Google Maps.', 'Map (pin): new search. Type a church, venue, address or village and pick from the results; the pin is placed automatically and can be dragged to adjust. If the event already has the location typed, the search runs automatically. Coordinates or a Google Maps link also work.'],
    ],
  },
  {
    v: '1.7.2', date: '02/11/2026',
    items: [
      ['👥', 'Ημερολόγιο → «+» → «Meeting»: ημερομηνία, ώρα, τοποθεσία, ποιους αφορά (με γρήγορες επιλογές «Όλοι», «Διαχειριστές», «Φωτογράφοι», «Βιντεογράφοι») και λόγοι. Οι έτοιμοι λόγοι προστίθενται, αλλάζουν ή αφαιρούνται από το «Επεξεργασία λόγων».', 'Calendar → “+” → “Meeting”: date, time, place, who it concerns (with quick picks “Everyone”, “Admins”, “Photographers”, “Videographers”) and reasons. The ready reasons can be added, edited or removed via “Edit reasons”.'],
      ['🔔', 'Μόλις δημιουργηθεί ένα meeting, όσοι το αφορά παίρνουν ειδοποίηση· το ίδιο όταν αλλάξει ή ακυρωθεί. Το meeting εμφανίζεται στο ημερολόγιο και στην Αρχική τους.', 'Once a meeting is created, everyone it concerns is notified; the same when it changes or is cancelled. It shows in their calendar and on Home.'],
    ],
  },
  {
    v: '1.7.1', date: '02/11/2026',
    items: [
      ['📌', 'Ημερολόγιο → «+» → «Άλλο»: ελεύθερη καταχώρηση στο ημερολόγιο. Υποχρεωτικός μόνο ο τίτλος· προαιρετικά ώρα, τοποθεσία και σημειώσεις. Μπορεί να το βλέπει όλη η ομάδα ή μόνο οι διαχειριστές.', 'Calendar → “+” → “Other”: a free calendar entry. Only the title is required; time, location and notes are optional. It can be visible to the whole team or to admins only.'],
    ],
  },
  {
    v: '1.7', date: '02/11/2026',
    items: [
      ['➕', 'Ημερολόγιο: το κουμπί «Νέα εκδήλωση» έγινε ένα μεγάλο «+». Πατώντας το ανοίγει μενού με «Νέα εκδήλωση», «Προγραμματισμός ραντεβού», «Next day» και «Ευχολόγιο».', 'Calendar: the “New event” button is now a big “+”. Tapping it opens a menu with “New event”, “Schedule appointment”, “Next day” and “Blessing”.'],
      ['🟡', 'Προγραμματισμός ραντεβού: τύπος εκδήλωσης, ονοματεπώνυμο, ημερομηνία & ώρα ραντεβού, τηλέφωνο και πότε είναι η εκδήλωση. Εμφανίζεται κίτρινο στο «Παρουσίαση στο μαγαζί» («Ραντεβού για Γάμο αναμένεται στις: …») και στο ημερολόγιο («Ραντεβού για Γάμο 18:30»). Την ημέρα του ραντεβού βγαίνει πρώτο (και στην Αρχική) και με ένα πάτημα ξεκινά η παρουσίαση στο μαγαζί κανονικά.', 'Schedule appointment: event type, full name, appointment date & time, phone and when the event is. Shows in yellow under “In-store presentation” and in the calendar. On the day it comes first (also on Home) and one tap starts the in-store presentation as usual.'],
      ['🌅', 'Next day και Ευχολόγιο: διαλέγετε από ποια εκδήλωση είναι και την ημερομηνία (υποχρεωτικά)· ώρα και τοποθεσία προαιρετικά. Πελάτης και συνεργείο παίρνονται από την εκδήλωση, το συνεργείο ειδοποιείται και εμφανίζονται στο ημερολόγιο, στην Αρχική και μέσα στην καρτέλα της εκδήλωσης.', 'Next day and Blessing: choose which event it belongs to and the date (required); time and location are optional. Client and crew come from the event, the crew is notified, and they show in the calendar, on Home and inside the event card.'],
    ],
  },
  {
    v: '1.6.3', date: '02/11/2026',
    items: [
      ['🏠', 'Αρχική · «Οι επόμενες εκδηλώσεις μου»: σε έμφαση πλέον ο τύπος της εκδήλωσης, η τοποθεσία και η ώρα· το όνομα του πελάτη και τα υπόλοιπα ακολουθούν από κάτω.', 'Home · “My upcoming events”: the event type, location and time are now emphasised; the client name and the rest follow below.'],
    ],
  },
  {
    v: '1.6.2', date: '02/11/2026',
    items: [
      ['🚫', 'Οι απουσίες πολλών ημερών εμφανίζονται πλέον καθαρά στο ημερολόγιο ως συμπαγής μπάρα από την πρώτη έως την τελευταία ημέρα, όπως στο Google Calendar, με το όνομα και τη σημείωση (και στο κινητό).', 'Multi-day absences now show clearly in the calendar as one solid bar from the first to the last day, like in Google Calendar, with the name and note (on mobile too).'],
    ],
  },
  {
    v: '1.6.1', date: '02/11/2026',
    items: [
      ['🗓️', 'Ημερολόγιο: νέα προβολή «Χρόνος» με όλους τους μήνες της χρονιάς· οι ημέρες με εκδηλώσεις είναι χρωματισμένες και πατώντας μια ημέρα ή έναν μήνα ανοίγει.', 'Calendar: new “Year” view with all the months; days with events are coloured and tapping a day or month opens it.'],
      ['📏', 'Οι πολυήμερες εκδηλώσεις και απουσίες εμφανίζονται όπως στο Google Calendar: μία μπάρα που απλώνεται σε όλες τις ημέρες (Μήνας και Εβδομάδα).', 'Multi-day events and absences show like in Google Calendar: one bar spanning all their days (Month and Week).'],
    ],
  },
  {
    v: '1.6', date: '02/11/2026',
    items: [
      ['📆', 'Πολυήμερες εκδηλώσεις: στη δημιουργία εκδήλωσης ενεργοποιήστε «Πολυήμερη εκδήλωση» και βάλτε την τελευταία ημέρα. Η εκδήλωση εμφανίζεται σε όλες τις ημέρες της στο ημερολόγιο (με 1/3, 2/3 …), στις λίστες, στο Excel (στήλη «Έως»), στο «Στο κινητό» και στους ελέγχους διαθεσιμότητας.', 'Multi-day events: turn on “Multi-day event” when creating an event and set the last day. It shows on all its days in the calendar (1/3, 2/3 …), in lists, in the Excel (“Until” column), in “To phone” and in availability checks.'],
      ['🧑‍🤝‍🧑', 'Επιλογή συνεργείου: όποιος είναι ήδη δεσμευμένος σε άλλη εκδήλωση τις ίδιες ημέρες φαίνεται με πορτοκαλί, με τον τύπο και την ώρα της άλλης εκδήλωσης.', 'Crew selection: anyone already booked on another event the same days is shown in orange, with that event’s type and time.'],
      ['🔔', 'Ειδοποιήσεις ανάθεσης: η πρώτη γραμμή γράφει τύπο εκδήλωσης, τοποθεσία και ώρα, και μετά όλα τα υπόλοιπα.', 'Assignment notifications: the first line shows the event type, location and time, then everything else.'],
      ['🚫', 'Απουσίες πολλών ημερών εμφανίζονται και διαγράφονται ως μία απουσία (π.χ. «3 ημέρες»).', 'Multi-day absences are shown and deleted as one absence (e.g. “3 days”).'],
    ],
  },
  {
    v: '1.5.3', date: '01/11/2026',
    items: [
      ['⏰', 'Ώρα εκδήλωσης: δίπλα στο πεδίο της ώρας υπάρχει η επιλογή «Δεν γνωρίζουμε ακόμη». Ισχύει και για τις υπάρχουσες εκδηλώσεις (Επεξεργασία).', 'Event time: next to the time field there is a “Not known yet” option. It also works for existing events (Edit).'],
      ['🔔', 'Αν μια εκδήλωση δεν έχει ακόμη ώρα 3 μήνες πριν, οι διαχειριστές λαμβάνουν ειδοποίηση για να τη συμπληρώσουν.', 'If an event still has no time 3 months before, admins get a notification to fill it in.'],
    ],
  },
  {
    v: '1.5.1', date: '01/11/2026',
    items: [
      ['🎯', 'Νέα εκδήλωση: επιλογή κάλυψης «Φωτογραφία & βίντεο», «Μόνο φωτογραφία» ή «Μόνο βίντεο». Αλλάζει και από το μεγάλο Excel (στήλη «Κάλυψη»).', 'New event: choose coverage “Photo & video”, “Photo only” or “Video only”. Also editable in the main Excel (“Coverage” column).'],
      ['⚙️', 'Οι εκδηλώσεις «Μόνο φωτογραφία» δεν μπαίνουν στο φύλλο Dimitris και δεν βγάζουν SOS βίντεο· οι «Μόνο βίντεο» δεν έχουν στάδια φωτογραφιών στην Κατάσταση Εργασιών. Η αρμοδιότητα του συνεργείου ακολουθεί την κάλυψη.', '“Photo only” events don’t appear in the Dimitris sheet and raise no video SOS; “Video only” events have no photo stages in Work status. Crew duties follow the coverage.'],
    ],
  },
  {
    v: '1.5', date: '01/11/2026',
    items: [
      ['👥', 'Νέα εκδήλωση: επιλογή «1 συνεργείο (βασικό)» ή «2 συνεργεία». Με 2 συνεργεία επιλέγετε τα άτομα, τα χωρίζετε σε συνεργείο 1 και 2 και ορίζετε τι αναλαμβάνει το καθένα (Σπίτι γαμπρού/νύφης, Εκκλησία, Κέντρο, Drone).', 'New event: choose “1 crew (main)” or “2 crews”. With 2 crews you pick the people, split them into crew 1 and 2 and set what each covers (Groom/bride homes, Church, Reception, Drone).'],
      ['📝', 'Κάθε μέλος του συνεργείου έχει μέσα στην εκδήλωση το δικό του κείμενο ανάθεσης, που φτιάχνεται αυτόματα και μπορεί να αλλάξει. Οι ειδοποιήσεις γράφουν σε κάθε μέλος τι αναλαμβάνει και ποιοι είναι μαζί του.', 'Each crew member has their own assignment note inside the event, generated automatically and editable. Notifications tell each member what they cover and who is with them.'],
      ['🚫', 'Δήλωση απουσίας στο Ημερολόγιο: κάθε μέλος δηλώνει τις μέρες/ώρες που δεν είναι διαθέσιμο και οι διαχειριστές μπορούν να δηλώσουν για οποιονδήποτε.', 'Absence declarations in the Calendar: each member declares days/hours they are unavailable and admins can declare for anyone.'],
      ['⛔', 'Στην επιλογή συνεργείου, όποιος δεν είναι διαθέσιμος εκείνη την ημέρα φαίνεται αλλά δεν επιλέγεται, με τις ώρες σε παρένθεση.', 'When choosing the crew, anyone unavailable that day is shown but cannot be selected, with the hours in brackets.'],
    ],
  },
  {
    v: '1.4.2', date: '31/10/2026',
    items: [
      ['🔢', 'iPhone: το PIN πληκτρολογείται γρήγορα χωρίς zoom — δύο ίδια ψηφία στη σειρά (π.χ. 11) μετράνε κανονικά ως δύο πατήματα.', 'iPhone: the PIN can be typed quickly without zooming — two identical digits in a row (e.g. 11) count as two taps.'],
      ['🔍', 'iPhone: η εφαρμογή δεν κάνει πια zoom με διπλό πάτημα ούτε όταν πατάτε σε πεδίο για να γράψετε. Το zoom με δύο δάχτυλα λειτουργεί κανονικά.', 'iPhone: the app no longer zooms on double-tap or when you tap a field to type. Two-finger zoom still works.'],
    ],
  },
  {
    v: '1.4.1', date: '31/10/2026',
    items: [
      ['🎞️', 'Φύλλο Dimitris: η «Κατάσταση Βίντεο» (όχι έτοιμο, υπό επεξεργασία, έτοιμο να γίνει export, έτοιμο) είναι πλέον ξεχωριστή στήλη και η «Κατάσταση editing» στο μεγάλο Excel κρατά τις γνωστές επιλογές.', 'Dimitris sheet: “Video status” (not ready, in progress, ready for export, ready) is now its own column and “Editing status” in the main Excel keeps its usual options.'],
      ['🚦', 'Νέα στήλη «Προτεραιότητα» στο φύλλο Dimitris, που αλλάζει μόνη της: φωτογραφίες σε «Αλλαγές» → «Να γίνει», album σε «Εκτύπωση στο εργαστήριο» → SOS. Γίνεται «Έτοιμο» (και στο μεγάλο Excel, φεύγει το SOS) μόνο όταν το βίντεο είναι «έτοιμο» και «παραδόθηκε στο μαγαζί».', 'New “Priority” column in the Dimitris sheet that updates itself: photos to “Changes” → “To do”, album to the lab → SOS. It becomes “Ready” (also in the main Excel, SOS clears) only when the video is “ready” and “delivered to the shop”.'],
    ],
  },
  {
    v: '1.4', date: '31/10/2026',
    items: [
      ['🎬', 'Το φύλλο Dimitris έγινε ίδιο με το Google Sheet του: Μήνας, Ημερομηνία, Κατηγορία, Τοποθεσία, Κατάσταση Βίντεο, Είναι στο μαγαζί;, Υπολογιστής, Περασμένα αρχεία, Αποθηκευμένο σε και Σχόλια, με χρωματιστές επιλογές.', 'The Dimitris sheet now matches his Google Sheet: Month, Date, Category, Location, Video status, In the shop?, Computer, Files copied, Stored at and Comments, with coloured options.'],
    ],
  },
  {
    v: '1.3', date: '30/10/2026',
    items: [
      ['🗄️', 'Μηνιαίο αντίγραφο ασφαλείας: από την 1η κάθε μήνα εμφανίζεται οθόνη με έτοιμα τα κουμπιά αντιγράφου. Μέχρι να κατεβάσει αντίγραφο ένας διαχειριστής, κανένας διαχειριστής δεν συνεχίζει στην εφαρμογή. Ξεκινά από 1 Νοεμβρίου.', 'Monthly backup: from the 1st of every month a screen appears with the backup buttons ready. Until one admin downloads a backup, no admin can continue in the app. Starts 1 November.'],
      ['📄', 'Σελίδα εκδήλωσης: «Επεξεργασία της συγκεκριμένης προσφοράς» στο Πακέτο & προσφορά, χωρίς το ανέβασμα έτοιμου PDF.', 'Event page: “Edit this offer” under Package & offer, without the ready-PDF upload.'],
      ['🚁', 'Σελίδα εκδήλωσης: δίπλα σε κατηγορία και ανάλυση φαίνεται «Drone» όταν η εκδήλωση έχει drone.', 'Event page: “Drone” appears next to the category and resolution when the event includes a drone.'],
    ],
  },
  {
    v: '1.2.1', date: '30/10/2026',
    items: [
      ['👶', 'Ενημερωμένος Οδηγός προσφοράς βάπτισης: τα μικρά album 47×20 επιλέγονται πλέον σε όση ποσότητα χρειάζεται (+70€ το καθένα).', 'Updated baptism offer builder: small 47×20 albums can now be added in any quantity (+70€ each).'],
    ],
  },
  {
    v: '1.2', date: '30/10/2026',
    items: [
      ['👶', 'Νέος Οδηγός προσφοράς βάπτισης: στη δημιουργία εκδήλωσης βάπτισης η προσφορά γίνεται με το πακέτο βάπτισης 2027 (βασικό πακέτο, αναβαθμίσεις, album, εκτυπώσεις, τελική τιμή) και το PDF επισυνάπτεται αυτόματα.', 'New baptism offer builder: when creating a baptism event, the offer uses the 2027 baptism package (base package, upgrades, album, prints, final price) and the PDF is attached automatically.'],
      ['✅', 'Η προσφορά βάπτισης είναι υποχρεωτική για να αποθηκευτεί η εκδήλωση, όπως και στους γάμους.', 'The baptism offer is required to save the event, just like for weddings.'],
      ['📋', 'Το συνεργείο βλέπει στη βάπτιση τι περιλαμβάνει η κάλυψη (π.χ. drone, φωτογράφηση πριν), χωρίς τιμές.', 'For baptisms the crew sees what the coverage includes (e.g. drone, pre-baptism shoot), without prices.'],
    ],
  },
  {
    v: '1.1.4', date: '30/10/2026',
    items: [
      ['📄', 'Διαφημιστικό και Άλλο: η εκδήλωση δημιουργείται χωρίς PDF προσφοράς. Στο τελευταίο βήμα συμπληρώνετε μόνο την αξία και τα στοιχεία του πακέτου.', 'Promo and Other: the event is created without an offer PDF. In the last step you only fill in the value and package details.'],
    ],
  },
  {
    v: '1.1.3', date: '30/10/2026',
    items: [
      ['🏠', 'Νέα εκδήλωση: τα πεδία «Σπίτι νύφης» και «Σπίτι γαμπρού» εμφανίζονται μόνο σε Γάμο και Γαμοβάπτιση.', 'New event: “Bride’s home” and “Groom’s home” appear only for Wedding and Wedding & Baptism.'],
      ['📍', 'Διαφημιστικό και Άλλο: απλή φόρμα με «Τοποθεσία» και «Σχόλια», χωρίς εκκλησία και δεξίωση.', 'Promo and Other: a simple form with “Location” and “Comments”, without church and reception.'],
    ],
  },
  {
    v: '1.1.2', date: '30/10/2026',
    items: [
      ['📋', 'Κατάσταση Εργασιών: στο «Σε εξέλιξη» εμφανίζονται όλες οι κλεισμένες εκδηλώσεις, όποια χρονιά κι αν είναι (και του 2027), μέχρι να παραδοθούν. Η επιλογή χρονιάς εμφανίζεται στα «Παραδόθηκαν» και «Όλες».', 'Work status: “In progress” shows every booked event, whatever the year (2027 too), until delivered. The year picker appears under “Delivered” and “All”.'],
    ],
  },
  {
    v: '1.1.1', date: '30/10/2026',
    items: [
      ['📑', 'Η καρτέλα «Mitsos» μετονομάστηκε σε «Dimitris» και η σελίδα μοντάζ σε «Editing Workflow».', 'The “Mitsos” tab is now called “Dimitris” and the editing page “Editing Workflow”.'],
    ],
  },
  {
    v: '1.1', date: '30/10/2026',
    items: [
      ['🗓️', 'Νέο ημερολόγιο με προβολές Ημέρα, Εβδομάδα, Μήνας και Πρόγραμμα. Πατήστε σε κενή ώρα για να δημιουργήσετε εκδήλωση εκείνη την ώρα.', 'New calendar with Day, Week, Month and Schedule views. Tap an empty time slot to create an event at that time.'],
      ['🕕', 'Όλες οι ώρες εμφανίζονται σε 24ωρη μορφή (π.χ. 18:00).', 'All times are shown in 24-hour format (e.g. 18:00).'],
      ['🏠', 'Σπίτι νύφης και σπίτι γαμπρού είναι πλέον ξεχωριστά πεδία στην εκδήλωση.', 'Bride’s house and groom’s house are now separate fields on the event.'],
      ['📍', 'Χάρτης με pin: επιλέγετε εσείς το ακριβές σημείο για εκκλησία, σπίτια και δεξίωση, και το συνεργείο ανοίγει την πλοήγηση με ένα πάτημα.', 'Map pins: you choose the exact spot for the church, houses and reception, and the crew opens navigation with one tap.'],
      ['🚁', 'Νέα αρμοδιότητα «Drone» στην ανάθεση συνεργείου, δίπλα σε Φωτογραφία και Βίντεο.', 'New “Drone” duty in crew assignment, next to Photo and Video.'],
      ['🗑️', 'Οριστική διαγραφή εκδήλωσης και απευθείας από το φύλλο Excel.', 'Permanently delete an event directly from the Excel sheet too.'],
      ['🔔', 'Ειδοποιήσεις σε δύο καρτέλες: Μη αναγνωσμένες και Αναγνωσμένες.', 'Notifications in two tabs: Unread and Read.'],
      ['📋', 'Κατάσταση Εργασιών: κάθε εκδήλωση εμφανίζεται από τη στιγμή που κλείνεται.', 'Work status: every event appears from the moment it is booked.'],
      ['💶', 'Έσοδα & Έξοδα ανά έτος, με σύνολα για κάθε μήνα.', 'Income & Expenses by year, with totals for each month.'],
      ['➕', 'Προσθήκη δόσης από το Excel: η εκδήλωση και η κατηγορία είναι ήδη επιλεγμένες, για να μη γίνονται λάθη.', 'Adding an installment from the Excel: the event and category are already set, to avoid mistakes.'],
      ['📑', 'Dimitris: ανοίγει κατευθείαν στο δικό του φύλλο, με προεπιλογή «Όλα» και χωρίς τη στήλη Βιντεογράφος.', 'Dimitris: opens straight to its own sheet, defaulting to “All”, without the Videographer column.'],
      ['🏡', 'Αρχική: οι επόμενες εκδηλώσεις δείχνουν αν είναι μονό ή διπλό συνεργείο.', 'Home: upcoming events show whether it is a single or double crew.'],
    ],
  },
];
export const LATEST = RELEASES[0].v;
const WATERMARK = 'Αναπτύσσεται με το Claude (Anthropic)';

const mine = (r) => r.items.filter((it) => it[3] !== 'admin' || isAdmin());
const releaseHTML = (r) => `<div class="wn-rel">
  <div class="wn-ver"><span class="pill accent">v${esc(r.v)}</span><span class="small muted">${esc(r.date)}</span></div>
  <ul class="wn-list">${mine(r).map(([e, el, en]) => `<li><span class="wn-e">${e}</span><span>${esc(L(el, en))}</span></li>`).join('')}</ul></div>`;
const watermark = () => `<div class="wn-mark">${esc(WATERMARK)}</div>`;

const key = () => 'im.wn.' + (S.profile?.id || '');
const seen = () => { try { return localStorage.getItem(key()); } catch { return LATEST; } };
const markSeen = () => { try { localStorage.setItem(key(), LATEST); } catch {} };

/** Οι εκδόσεις που δεν έχει δει ακόμη ο χρήστης (το πολύ 4) και που έχουν κάτι που τον αφορά */
function unseen() {
  const s = seen();
  let i = RELEASES.findIndex((r) => r.v === s);
  if (i < 0) i = 1; // πρώτη φορά σε αυτή τη συσκευή: μόνο η τελευταία
  return RELEASES.slice(0, Math.min(i, 4)).filter((r) => mine(r).length);
}

/** Μία φορά ανά ενημέρωση, για όλη την ομάδα (οι νέοι χρήστες βλέπουν πρώτα την περιήγηση) */
export function maybeShowWhatsNew() {
  if (!S.profile) return;
  let tourDone = false;
  try { tourDone = !!localStorage.getItem('im.tour.' + S.profile?.id); } catch { return; }
  if (!tourDone) { markSeen(); return; }
  if (seen() === LATEST) return;
  if (!unseen().length) { markSeen(); return; }
  setTimeout(() => showWhatsNew(), 900);
}

export function showWhatsNew() {
  const list = unseen();
  markSeen();
  const body = document.createElement('div');
  body.className = 'wn';
  body.innerHTML = `<div class="wn-hero"><div class="wn-big">✨</div><h2>${esc(L('Τι νέο υπάρχει', 'What’s new'))}</h2><p class="muted small">${esc(L('Η εφαρμογή ενημερώθηκε. Αυτές είναι οι αλλαγές:', 'The app was updated. Here are the changes:'))}</p></div>
    ${(list.length ? list : [RELEASES[0]]).map(releaseHTML).join('<hr class="wn-sep">')}${watermark()}
    <div class="center small mt"><a href="#/whatsnew" data-close>${esc(L('Όλες οι προηγούμενες ενημερώσεις', 'All previous updates'))}</a></div>`;
  sheet({ title: L('Ενημέρωση', 'Update'), body, right: `<button class="btn plain" data-close><b>${esc(L('Εντάξει', 'OK'))}</b></button>` });
}

export function renderWhatsNew(root) {
  markSeen();
  root.innerHTML = pageHead(L('Τι νέο υπάρχει', 'What’s new'), { sub: esc(L('Οι αλλαγές σε κάθε ενημέρωση της εφαρμογής.', 'Changes in every app update.')) })
    + `<div class="wn card pad">${RELEASES.filter((r) => mine(r).length).map(releaseHTML).join('<hr class="wn-sep">')}${watermark()}</div>`
    + `<div class="hstack mt"><a class="btn" href="#/home">${icon('chevL')} ${esc(L('Αρχική', 'Home'))}</a></div>`;
}
