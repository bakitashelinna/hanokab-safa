// ============================================================================
// Hanukkah Educational Learning Application Logic - Grade 2 (כִּיתָה ב')
// Designed for Grade 2 Reading: Vocabulary, Missing Syllables, Missing Words,
// True/False, Scrambled Letters, Logical Chronological Sequence, and Sentence-Picture Matching.
// ============================================================================

class HanukkahApp {
  constructor() {
    this.stations = GAME_STATIONS;
    this.currentStationIdx = 0;
    this.currentQuestionIdx = 0;
    this.stars = 0;
    this.completedStations = new Set();
    
    // Scrambled letters state
    this.scrambledState = {
      userLetters: [],
      usedIndices: []
    };

    this.hasAnsweredCurrent = false;
  }

  init() {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    this.renderStationsNav();
    this.renderCurrentQuestion();
    this.bindGlobalEvents();
    this.updateStarsDisplay();
    this.initMusicPlayerUI();
  }

  bindGlobalEvents() {
    // Sound Effects Mute Toggle
    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isMuted = soundManager.toggleMute();
        soundBtn.textContent = isMuted ? '🔇' : '🔊';
        soundBtn.title = isMuted ? 'הַפְעֵל צְלִילִים' : 'הַשְׁתֵּק צְלִילִים';
      });
    }

    // Modal Close / Next Stage
    const modalBtn = document.getElementById('btn-modal-advance');
    if (modalBtn) {
      modalBtn.addEventListener('click', () => {
        this.closeCelebrationModal();
        if (this.currentStationIdx < this.stations.length - 1) {
          this.switchStation(this.currentStationIdx + 1);
        } else {
          // Restart to station 0 after grand finale
          this.switchStation(0);
        }
      });
    }

    // Glossary Modal Toggle
    const glossaryBtn = document.getElementById('btn-open-glossary');
    const closeGlossaryBtn = document.getElementById('btn-close-glossary');
    const glossaryModal = document.getElementById('glossary-modal');

    if (glossaryBtn && glossaryModal) {
      glossaryBtn.addEventListener('click', () => {
        soundManager.playClick();
        this.renderGlossaryContent();
        glossaryModal.classList.add('active');
      });
    }
    if (closeGlossaryBtn && glossaryModal) {
      closeGlossaryBtn.addEventListener('click', () => {
        soundManager.playClick();
        glossaryModal.classList.remove('active');
      });
    }
  }

  // ==========================================================================
  // Music Player UI Integration
  // ==========================================================================
  initMusicPlayerUI() {
    const playToggleBtn = document.getElementById('btn-music-toggle');
    const playIcon = document.getElementById('music-play-icon');
    const trackTitleEl = document.getElementById('music-track-title');
    const nextTrackBtn = document.getElementById('btn-music-next');

    if (typeof musicPlayer !== 'undefined' && playToggleBtn) {
      playToggleBtn.addEventListener('click', () => {
        const isPlaying = musicPlayer.togglePlay();
        if (playIcon) playIcon.textContent = isPlaying ? '⏸️' : '▶️';
        if (trackTitleEl) trackTitleEl.textContent = musicPlayer.getCurrentTrackTitle();
      });

      if (nextTrackBtn) {
        nextTrackBtn.addEventListener('click', () => {
          musicPlayer.nextTrack();
          if (playIcon) playIcon.textContent = musicPlayer.isPlaying ? '⏸️' : '▶️';
          if (trackTitleEl) trackTitleEl.textContent = musicPlayer.getCurrentTrackTitle();
        });
      }
    }
  }

  // ==========================================================================
  // Stations Navigation
  // ==========================================================================
  renderStationsNav() {
    const navContainer = document.getElementById('stations-nav-bar');
    if (!navContainer) return;

    navContainer.innerHTML = '';
    this.stations.forEach((st, idx) => {
      const btn = document.createElement('button');
      btn.className = `station-nav-btn ${idx === this.currentStationIdx ? 'active' : ''} ${this.completedStations.has(idx) ? 'completed' : ''}`;
      btn.innerHTML = `<span>${st.icon}</span> <span>תַּחֲנָה ${st.stationNumber}: ${st.title}</span>`;
      btn.addEventListener('click', () => {
        soundManager.playClick();
        this.switchStation(idx);
      });
      navContainer.appendChild(btn);
    });
  }

  switchStation(newIndex) {
    if (newIndex < 0 || newIndex >= this.stations.length) return;
    this.currentStationIdx = newIndex;
    this.currentQuestionIdx = 0;
    this.hasAnsweredCurrent = false;
    this.renderStationsNav();
    this.renderCurrentQuestion();
    
    // Always scroll smoothly back to the top of the page (to display top branding & header)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateStarsDisplay() {
    const el = document.getElementById('stars-counter-val');
    if (el) el.textContent = this.stars;
  }

  get currentStation() {
    return this.stations[this.currentStationIdx];
  }

  get currentQuestion() {
    return this.currentStation.questions[this.currentQuestionIdx];
  }

  // ==========================================================================
  // Question Rendering Dispatcher
  // ==========================================================================
  renderCurrentQuestion() {
    const st = this.currentStation;
    const q = this.currentQuestion;
    this.hasAnsweredCurrent = false;

    // Header info
    document.getElementById('station-badge-num').textContent = st.stationNumber;
    document.getElementById('station-title-text').textContent = st.title;
    document.getElementById('progress-text').textContent = `מְשִׂימָה ${this.currentQuestionIdx + 1} מִתּוֹךְ ${st.questions.length}`;
    document.getElementById('instruction-text').textContent = st.instruction;

    // Reset feedback banner
    const feedbackBanner = document.getElementById('feedback-banner');
    feedbackBanner.className = 'feedback-banner';
    feedbackBanner.innerHTML = '';

    // Render activity area based on station type
    const activityContainer = document.getElementById('activity-content');
    activityContainer.innerHTML = '';

    switch (st.type) {
      case 'picture_word_match':
        this.renderPictureWordMatch(activityContainer, q);
        break;
      case 'missing_syllable':
        this.renderMissingSyllable(activityContainer, q);
        break;
      case 'sentence_completion':
        this.renderSentenceCompletion(activityContainer, q);
        break;
      case 'true_false':
        this.renderTrueFalse(activityContainer, q);
        break;
      case 'scrambled_letters':
        this.renderScrambledLetters(activityContainer, q);
        break;
      case 'sequence_order':
        this.renderSequenceOrder(activityContainer, q);
        break;
      case 'sentence_picture_match':
        this.renderSentencePictureMatch(activityContainer, q);
        break;
      default:
        activityContainer.textContent = 'שְׁגִיאָה בִּטְעִינַת הַפְּעִילוּת.';
    }
  }

  // ==========================================================================
  // תַּחֲנָה 1: הַתְאָמַת מִלָּה לִתְמוּנָה (Match word to picture - 3 choices)
  // ==========================================================================
  renderPictureWordMatch(container, q) {
    const svgCard = document.createElement('div');
    svgCard.className = 'svg-display-card';
    svgCard.innerHTML = SVGS[q.svgKey] || '';
    container.appendChild(svgCard);

    const grid = document.createElement('div');
    grid.className = 'options-grid';

    q.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn-choice';
      btn.textContent = optText;
      btn.addEventListener('click', () => {
        this.handleStandardChoice(btn, idx === q.correctIndex, q.explanation);
      });
      grid.appendChild(btn);
    });

    container.appendChild(grid);
  }

  // ==========================================================================
  // תַּחֲנָה 2: הַשְׁלָמַת צֵרוּף פּוֹתֵחַ חָסֵר בַּמִּלָּה
  // ==========================================================================
  renderMissingSyllable(container, q) {
    const svgCard = document.createElement('div');
    svgCard.className = 'svg-display-card';
    svgCard.innerHTML = SVGS[q.svgKey] || '';
    container.appendChild(svgCard);

    const stemBox = document.createElement('div');
    stemBox.className = 'stem-display';
    stemBox.id = 'stem-display-box';
    stemBox.innerHTML = q.stem.replace('___', '<span class="stem-missing-box">?</span>');
    container.appendChild(stemBox);

    const grid = document.createElement('div');
    grid.className = 'options-grid';

    q.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn-choice';
      btn.textContent = optText;
      btn.addEventListener('click', () => {
        if (idx === q.correctIndex) {
          const stemEl = document.getElementById('stem-display-box');
          if (stemEl) {
            stemEl.innerHTML = `<span class="stem-missing-box" style="color: #2e7d32;">${optText}</span>${q.stem.replace('___', '')}`;
          }
        }
        this.handleStandardChoice(btn, idx === q.correctIndex, q.explanation);
      });
      grid.appendChild(btn);
    });

    container.appendChild(grid);
  }

  // ==========================================================================
  // תַּחֲנָה 3: הַשְׁלָמַת מִלָּה חֲסֵרָה בַּמִּשְׁפָּט (Sentence completion - 3 choices)
  // ==========================================================================
  renderSentenceCompletion(container, q) {
    if (q.svgKey && SVGS[q.svgKey]) {
      const svgCard = document.createElement('div');
      svgCard.className = 'svg-display-card';
      svgCard.innerHTML = SVGS[q.svgKey];
      container.appendChild(svgCard);
    }

    const sentenceBox = document.createElement('div');
    sentenceBox.className = 'sentence-box';
    sentenceBox.innerHTML = `${q.sentenceBefore}<span class="sentence-blank" id="sentence-blank-box">_______</span>${q.sentenceAfter}`;
    container.appendChild(sentenceBox);

    const grid = document.createElement('div');
    grid.className = 'options-grid';

    q.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn-choice';
      btn.textContent = optText;
      btn.addEventListener('click', () => {
        if (idx === q.correctIndex) {
          const blankEl = document.getElementById('sentence-blank-box');
          if (blankEl) {
            blankEl.textContent = optText;
            blankEl.style.color = '#2e7d32';
          }
        }
        this.handleStandardChoice(btn, idx === q.correctIndex, q.explanation);
      });
      grid.appendChild(btn);
    });

    container.appendChild(grid);
  }

  // ==========================================================================
  // תַּחֲנָה 4: נָכוֹן אוֹ לֹא נָכוֹן? (True / False)
  // ==========================================================================
  renderTrueFalse(container, q) {
    if (q.svgKey && SVGS[q.svgKey]) {
      const svgCard = document.createElement('div');
      svgCard.className = 'svg-display-card';
      svgCard.innerHTML = SVGS[q.svgKey];
      container.appendChild(svgCard);
    }

    const sentenceBox = document.createElement('div');
    sentenceBox.className = 'sentence-box';
    sentenceBox.textContent = q.statement;
    container.appendChild(sentenceBox);

    const row = document.createElement('div');
    row.className = 'tf-buttons-row';

    const trueBtn = document.createElement('button');
    trueBtn.className = 'btn-tf true-btn';
    trueBtn.innerHTML = '<span>נָכוֹן</span> <span>✔️</span>';
    trueBtn.addEventListener('click', () => {
      this.handleStandardChoice(trueBtn, q.isTrue === true, q.explanation);
    });

    const falseBtn = document.createElement('button');
    falseBtn.className = 'btn-tf false-btn';
    falseBtn.innerHTML = '<span>לֹא נָכוֹן</span> <span>❌</span>';
    falseBtn.addEventListener('click', () => {
      this.handleStandardChoice(falseBtn, q.isTrue === false, q.explanation);
    });

    row.appendChild(trueBtn);
    row.appendChild(falseBtn);
    container.appendChild(row);
  }

  // ==========================================================================
  // תַּחֲנָה 5: מִלָּה מְבֻלְבֶּלֶת (Scrambled letters word builder)
  // ==========================================================================
  renderScrambledLetters(container, q) {
    this.scrambledState.userLetters = [];
    this.scrambledState.usedIndices = [];

    const svgCard = document.createElement('div');
    svgCard.className = 'svg-display-card';
    svgCard.innerHTML = SVGS[q.svgKey] || '';
    container.appendChild(svgCard);

    // Target clue hint
    const clueBox = document.createElement('div');
    clueBox.style.fontSize = '1.35rem';
    clueBox.style.fontWeight = '800';
    clueBox.style.color = '#7b1fa2';
    clueBox.style.marginBottom = '8px';
    clueBox.textContent = `רֶמֶז: ${q.wordNikkud}`;
    container.appendChild(clueBox);

    const scrambledArea = document.createElement('div');
    scrambledArea.className = 'scrambled-area';

    // Slots container
    const slotsRow = document.createElement('div');
    slotsRow.className = 'target-slots-row';
    slotsRow.id = 'scrambled-slots-row';
    this.updateScrambledSlotsUI(slotsRow, q);
    scrambledArea.appendChild(slotsRow);

    // Available letters
    const lettersRow = document.createElement('div');
    lettersRow.className = 'available-letters-row';
    lettersRow.id = 'scrambled-letters-row';

    q.scrambled.forEach((letter, idx) => {
      const btn = document.createElement('button');
      btn.className = 'letter-btn';
      btn.textContent = letter;
      btn.id = `letter-btn-${idx}`;
      btn.addEventListener('click', () => {
        if (this.scrambledState.usedIndices.includes(idx)) return;
        soundManager.playClick();
        this.scrambledState.userLetters.push(letter);
        this.scrambledState.usedIndices.push(idx);
        btn.classList.add('used');
        this.updateScrambledSlotsUI(slotsRow, q);
        this.checkScrambledCompletion(q);
      });
      lettersRow.appendChild(btn);
    });

    scrambledArea.appendChild(lettersRow);

    // Reset / Undo buttons
    const controlsRow = document.createElement('div');
    controlsRow.className = 'puzzle-controls-row';

    const undoBtn = document.createElement('button');
    undoBtn.className = 'btn-secondary';
    undoBtn.textContent = '↶ מְחַק אוֹת אַחֲרוֹנָה';
    undoBtn.addEventListener('click', () => {
      if (this.scrambledState.userLetters.length === 0) return;
      soundManager.playClick();
      const lastIdx = this.scrambledState.usedIndices.pop();
      this.scrambledState.userLetters.pop();
      const targetBtn = document.getElementById(`letter-btn-${lastIdx}`);
      if (targetBtn) targetBtn.classList.remove('used');
      this.updateScrambledSlotsUI(slotsRow, q);
    });

    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn-secondary';
    resetBtn.textContent = '🔄 נַסּוּ מֵהַתְחָלָה';
    resetBtn.addEventListener('click', () => {
      soundManager.playClick();
      this.renderScrambledLetters(container, q);
    });

    controlsRow.appendChild(undoBtn);
    controlsRow.appendChild(resetBtn);
    scrambledArea.appendChild(controlsRow);

    container.appendChild(scrambledArea);
  }

  updateScrambledSlotsUI(slotsRow, q) {
    slotsRow.innerHTML = '';
    const targetLen = q.targetWord.length;

    for (let i = 0; i < targetLen; i++) {
      if (i < this.scrambledState.userLetters.length) {
        const tile = document.createElement('div');
        tile.className = 'slot-tile';
        tile.textContent = this.scrambledState.userLetters[i];
        slotsRow.appendChild(tile);
      } else {
        const empty = document.createElement('div');
        empty.className = 'slot-empty';
        slotsRow.appendChild(empty);
      }
    }
  }

  checkScrambledCompletion(q) {
    if (this.scrambledState.userLetters.length === q.targetWord.length) {
      const assembledWord = this.scrambledState.userLetters.join('');
      if (assembledWord === q.targetWord) {
        this.handlePositiveReinforcement(q.explanation);
      } else {
        this.handleRetryReinforcement("כִּמְעַט הִצְלַחְתֶּם! נַסּוּ לִלְחֹץ עַל 'נַסּוּ מֵהַתְחָלָה' וּלְסַדֵּר שׁוּב.");
      }
    }
  }

  // ==========================================================================
  // תַּחֲנָה 6: אֵיזֶה מִשְׁפָּט יָבוֹא קֹדֶם? (Sequence order)
  // ==========================================================================
  renderSequenceOrder(container, q) {
    if (q.svgKey && SVGS[q.svgKey]) {
      const svgCard = document.createElement('div');
      svgCard.className = 'svg-display-card';
      svgCard.innerHTML = SVGS[q.svgKey];
      container.appendChild(svgCard);
    }

    const col = document.createElement('div');
    col.className = 'sequence-options-col';

    const btnA = document.createElement('button');
    btnA.className = 'btn-sequence';
    btnA.innerHTML = `<span class="seq-label">1</span> <span>${q.sentenceA}</span>`;
    btnA.addEventListener('click', () => {
      const isCorrect = q.correctOrder === 'A_first';
      this.handleStandardChoice(btnA, isCorrect, q.explanation);
    });

    const btnB = document.createElement('button');
    btnB.className = 'btn-sequence';
    btnB.innerHTML = `<span class="seq-label">2</span> <span>${q.sentenceB}</span>`;
    btnB.addEventListener('click', () => {
      const isCorrect = q.correctOrder === 'B_first';
      this.handleStandardChoice(btnB, isCorrect, q.explanation);
    });

    col.appendChild(btnA);
    col.appendChild(btnB);
    container.appendChild(col);
  }

  // ==========================================================================
  // תַּחֲנָה 7: הַתְאָמַת מִשְׁפָּט לִתְמוּנָה (Match sentence to picture - 2 choices)
  // ==========================================================================
  renderSentencePictureMatch(container, q) {
    const svgCard = document.createElement('div');
    svgCard.className = 'svg-display-card';
    svgCard.innerHTML = SVGS[q.svgKey] || '';
    container.appendChild(svgCard);

    const col = document.createElement('div');
    col.className = 'sequence-options-col';

    const btnA = document.createElement('button');
    btnA.className = 'btn-sequence';
    btnA.innerHTML = `<span class="seq-label">א</span> <span>${q.sentenceA}</span>`;
    btnA.addEventListener('click', () => {
      const isCorrect = q.correctSentence === 'A';
      this.handleStandardChoice(btnA, isCorrect, q.explanation);
    });

    const btnB = document.createElement('button');
    btnB.className = 'btn-sequence';
    btnB.innerHTML = `<span class="seq-label">ב</span> <span>${q.sentenceB}</span>`;
    btnB.addEventListener('click', () => {
      const isCorrect = q.correctSentence === 'B';
      this.handleStandardChoice(btnB, isCorrect, q.explanation);
    });

    col.appendChild(btnA);
    col.appendChild(btnB);
    container.appendChild(col);
  }

  // ==========================================================================
  // Positive Reinforcement & Retry Logic
  // ==========================================================================
  handleStandardChoice(clickedBtn, isCorrect, explanation) {
    if (this.hasAnsweredCurrent) return;

    if (isCorrect) {
      clickedBtn.classList.remove('wrong');
      clickedBtn.classList.add('correct');
      this.handlePositiveReinforcement(explanation);
    } else {
      clickedBtn.classList.add('wrong');
      this.handleRetryReinforcement();
      setTimeout(() => {
        clickedBtn.classList.remove('wrong');
      }, 700);
    }
  }

  handlePositiveReinforcement(explanation) {
    this.hasAnsweredCurrent = true;
    soundManager.playSuccess();
    this.stars += 1;
    this.updateStarsDisplay();

    // Disable choice buttons to avoid duplicate clicks
    const allButtons = document.querySelectorAll('.btn-choice, .btn-tf, .btn-sequence');
    allButtons.forEach(b => b.disabled = true);

    const banner = document.getElementById('feedback-banner');
    banner.className = 'feedback-banner show success';

    const positivePraise = [
      "כָּל הַכָּבוֹד! תְּשׁוּבָה מְדֻיֶּקֶת! 🌟",
      "מְצֻיָּן! אַתֶּם מַמָּשׁ אַלּוּפִים! 👏",
      "נָכוֹן מְאוֹד! יֹפִי שֶׁל קְרִיאָה! ✨",
      "נִפְלָא בְּיוֹתֵר! הַמְשִׁיכוּ כָּךְ! 🎯"
    ];
    const praiseText = positivePraise[Math.floor(Math.random() * positivePraise.length)];

    banner.innerHTML = `
      <div>${praiseText}</div>
      <div style="font-size: 1.15rem; font-weight: 600; color: #1b5e20;">${explanation || ''}</div>
      <button class="btn-next-question" id="btn-next-q">
        <span>הַמְשֵׁךְ לַמְּשִׂימָה הַבָּאָה</span>
        <span>➜</span>
      </button>
    `;

    document.getElementById('btn-next-q').addEventListener('click', () => {
      soundManager.playClick();
      this.advanceQuestion();
    });
  }

  handleRetryReinforcement(customMessage = null) {
    soundManager.playRetry();

    const banner = document.getElementById('feedback-banner');
    banner.className = 'feedback-banner show retry';

    const retryTips = [
      "לֹא נוֹרָא, נַסּוּ שׁוּב! כְּדַאי לִקְרֹא עוֹד פַּעַם בְּסַבְלָנוּת 🌱",
      "כִּמְעַט! נַסּוּ אֶפְשָׁרוּת אַחֶרֶת 💡",
      "לֹא מְדֻיָּק, הַבִּיטוּ שׁוּב בַּתְּמוּנָה וְנַסּוּ שׁוּב! 🔍"
    ];
    const tipText = customMessage || retryTips[Math.floor(Math.random() * retryTips.length)];

    banner.innerHTML = `
      <div>${tipText}</div>
      <div style="font-size: 1.05rem; font-weight: 600; color: #b26a00;">בְּחַרוּ תְּשׁוּבָה נוֹסֶפֶת כְּדֵי לְתַקֵּן.</div>
    `;
  }

  advanceQuestion() {
    const st = this.currentStation;
    if (this.currentQuestionIdx < st.questions.length - 1) {
      this.currentQuestionIdx++;
      this.renderCurrentQuestion();
    } else {
      // Stage completed!
      this.completedStations.add(this.currentStationIdx);
      this.renderStationsNav();
      this.showCelebrationModal();
    }
  }

  // ==========================================================================
  // End of Stage / Trophy Celebration Modal
  // ==========================================================================
  showCelebrationModal() {
    const modal = document.getElementById('trophy-modal');
    if (!modal) return;

    soundManager.playApplause();
    confetti.launch(5000);

    const st = this.currentStation;
    document.getElementById('trophy-stage-title').textContent = `סִיַּמְתֶּם אֶת תַּחֲנָה ${st.stationNumber}: ${st.title}!`;
    document.getElementById('trophy-stars-info').textContent = `צְבַרְתֶּם עַד כֹּה ${this.stars} כּוֹכָבֵי הַצְלָחָה! ⭐`;

    const advanceBtn = document.getElementById('btn-modal-advance');
    if (this.currentStationIdx < this.stations.length - 1) {
      advanceBtn.innerHTML = `<span>עֲבֹר לַתַּחֲנָה הַבָּאָה</span> <span>🏆</span>`;
    } else {
      advanceBtn.innerHTML = `<span>אַלּוּפֵי חֲנֻכָּה! שַׂחֲקוּ שׁוּב</span> <span>🎉</span>`;
    }

    modal.classList.add('active');
  }

  closeCelebrationModal() {
    const modal = document.getElementById('trophy-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    confetti.stop();
  }

  // ==========================================================================
  // Glossary / Dictionary Modal
  // ==========================================================================
  renderGlossaryContent() {
    const container = document.getElementById('glossary-grid');
    if (!container) return;

    container.innerHTML = '';
    HANUKKAH_GLOSSARY.forEach(item => {
      const card = document.createElement('div');
      card.className = 'glossary-item-card';

      const svgWrap = document.createElement('div');
      svgWrap.className = 'glossary-svg-wrap';
      svgWrap.innerHTML = SVGS[item.svgKey] || '';
      card.appendChild(svgWrap);

      const wordEl = document.createElement('div');
      wordEl.className = 'glossary-word';
      wordEl.textContent = item.word;
      card.appendChild(wordEl);

      const descEl = document.createElement('div');
      descEl.className = 'glossary-desc';
      descEl.textContent = item.desc;
      card.appendChild(descEl);

      container.appendChild(card);
    });
  }
}

// Instantiate on DOM load and enforce scroll at top
document.addEventListener('DOMContentLoaded', () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  window.app = new HanukkahApp();
  window.app.init();

  setTimeout(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, 50);
});
