/* =========================================================
   G3 · BTP — Quiz (15 questions)
   Presenting: → / Space reveals the answer, → again moves on.
   A–D (or 1–4) picks an option, R reveals.
   ========================================================= */
(function () {
  'use strict';

  const L = (o) => (typeof o === 'string' ? o : `<span class="en">${o.en}</span><span class="vi">${o.vi}</span>`);
  const KIND = {
    calc: { en: 'Calculation', vi: 'Tính toán' },
    scen: { en: 'Scenario', vi: 'Tình huống' }
  };
  const LET = ['A', 'B', 'C', 'D'];

  const QUIZ = [
    {
      kind: 'calc', ch: '2.1', ans: 1,
      title: { en: 'Computing FAR and FRR', vi: 'Tính FAR và FRR' },
      q: {
        en: 'The team tests a face matcher on 5 genuine and 5 impostor comparisons (similarity scores):<br><span class="data">Genuine: 0.95, 0.81, 0.73, 0.66, 0.48</span><br><span class="data">Impostor: 0.12, 0.30, 0.44, 0.58, 0.69</span><br>At threshold τ = 0.5 (accept if S ≥ τ), what are FAR and FRR?',
        vi: 'Nhóm kiểm thử một bộ so khớp khuôn mặt trên 5 phép so genuine và 5 phép so impostor (điểm tương đồng):<br><span class="data">Genuine: 0.95, 0.81, 0.73, 0.66, 0.48</span><br><span class="data">Impostor: 0.12, 0.30, 0.44, 0.58, 0.69</span><br>Với ngưỡng τ = 0.5 (chấp nhận nếu S ≥ τ), FAR và FRR bằng bao nhiêu?'
      },
      opts: ['FAR 20%, FRR 20%', 'FAR 40%, FRR 20%', 'FAR 20%, FRR 40%', 'FAR 40%, FRR 0%'],
      why: {
        en: '2 of 5 impostor scores (0.58, 0.69) are ≥ 0.5 → <b>FAR = 40%</b>. 1 of 5 genuine scores (0.48) is &lt; 0.5 → <b>FRR = 20%</b>.',
        vi: '2/5 điểm impostor (0.58, 0.69) ≥ 0.5 → <b>FAR = 40%</b>. 1/5 điểm genuine (0.48) &lt; 0.5 → <b>FRR = 20%</b>.'
      }
    },
    {
      kind: 'scen', ch: '2.1, 2.3', ans: 1,
      title: { en: 'Comparing two vendors', vi: 'So sánh hai nhà cung cấp' },
      q: {
        en: 'Vendor A reports EER = 1%, vendor B reports EER = 3%. Vendor A tested with impostors who <b>did not</b> have the user\'s token. What should VietBank do?',
        vi: 'Nhà cung cấp A báo EER = 1%, nhà cung cấp B báo EER = 3%. A kiểm thử với kẻ giả mạo <b>không</b> có token của người dùng. VietBank nên làm gì?'
      },
      opts: [
        { en: 'Choose A, since its EER is lower', vi: 'Chọn A vì EER thấp hơn' },
        { en: 'Re-test A with impostors holding a valid token (stolen-token), then compare both at the same FAR', vi: 'Kiểm thử lại A với kẻ giả mạo cầm token hợp lệ (stolen-token), rồi so cả hai ở cùng FAR' },
        { en: 'Choose B, since it is more honest', vi: 'Chọn B vì “trung thực” hơn' },
        { en: 'Compare only the template sizes', vi: 'Chỉ so kích thước template' }
      ],
      why: {
        en: 'An EER measured without the stolen-token scenario can be an illusion. Security must be evaluated assuming the attacker knows everything except the victim\'s biometric (full disclosure).',
        vi: 'EER đo khi không có kịch bản stolen-token có thể chỉ là “ảo giác”. Phải đánh giá an toàn với giả định kẻ tấn công biết mọi thứ trừ mẫu sinh trắc của nạn nhân (full disclosure).'
      }
    },
    {
      kind: 'scen', ch: '3.1', ans: 1,
      title: { en: 'Mobile app, highest accuracy', vi: 'Ứng dụng di động, độ chính xác cao nhất' },
      q: {
        en: 'Customers log in to the app with their face, and every phone can store a secret token. The team wants the lowest possible FAR. Which scheme?',
        vi: 'Khách hàng đăng nhập ứng dụng bằng khuôn mặt, và mỗi điện thoại có thể lưu một token bí mật. Nhóm muốn FAR thấp nhất có thể. Chọn phương pháp nào?'
      },
      opts: [
        { en: 'Polar transform', vi: 'Biến đổi Polar' },
        'BioHashing',
        'Fuzzy Vault',
        { en: 'Homomorphic encryption', vi: 'Mã hoá đồng hình' }
      ],
      gain: {
        en: 'two factors (face + token) → very low FAR, and a new token cancels a leaked template.',
        vi: 'hai yếu tố (khuôn mặt + token) → FAR rất thấp, và token mới sẽ huỷ template bị lộ.'
      },
      give: {
        en: 'if the token and the database leak together, protection falls to the unprotected level.',
        vi: 'nếu token và CSDL cùng bị lộ, mức bảo vệ tụt về như không bảo vệ.'
      }
    },
    {
      kind: 'calc', ch: '3.1', ans: 1,
      title: { en: 'Building a BioHash', vi: 'Tạo một BioHash' },
      q: {
        en: 'A face feature vector is <span class="data">x = [0.5, 0.3, −0.2, 0.4]</span>. The customer\'s token generates two orthonormal rows:<br><span class="data">r₁ = [0.5, 0.5, 0.5, 0.5]</span>&nbsp; <span class="data">r₂ = [0.5, −0.5, 0.5, −0.5]</span><br>Bit = 1 if the projection is &gt; 0. What is the BioHash?',
        vi: 'Vector đặc trưng khuôn mặt là <span class="data">x = [0.5, 0.3, −0.2, 0.4]</span>. Token của khách hàng sinh ra hai hàng trực chuẩn:<br><span class="data">r₁ = [0.5, 0.5, 0.5, 0.5]</span>&nbsp; <span class="data">r₂ = [0.5, −0.5, 0.5, −0.5]</span><br>Bit = 1 nếu giá trị chiếu &gt; 0. BioHash là gì?'
      },
      opts: ['11', '10', '01', '00'],
      why: 'r₁·x = 0.5 × (0.5 + 0.3 − 0.2 + 0.4) = <b>0.5 &gt; 0 → 1</b>.&nbsp; r₂·x = 0.5 × (0.5 − 0.3 − 0.2 − 0.4) = <b>−0.2 → 0</b>.'
    },
    {
      kind: 'scen', ch: '3.1', ans: 1,
      title: { en: 'ATM, no token allowed', vi: 'ATM, không được dùng token' },
      q: {
        en: 'Walk-in customers use a fingerprint at ATMs and cannot be asked to carry a card or token. Leaked templates must still be cancellable. Which scheme?',
        vi: 'Khách vãng lai dùng vân tay tại ATM và không thể bắt họ mang thẻ hay token. Template bị lộ vẫn phải huỷ được. Chọn phương pháp nào?'
      },
      opts: [
        'BioHashing',
        { en: 'Non-invertible transform (Cartesian / Polar / Functional)', vi: 'Biến đổi không khả nghịch (Cartesian / Polar / Functional)' },
        { en: 'Homomorphic encryption', vi: 'Mã hoá đồng hình' },
        { en: 'Unprotected minutiae', vi: 'Minutiae không bảo vệ' }
      ],
      gain: {
        en: 'no user secret (the key may even be public), templates can be re-issued.',
        vi: 'không cần bí mật của người dùng (khoá thậm chí có thể công khai), template cấp lại được.'
      },
      give: {
        en: 'some accuracy – see the next question.',
        vi: 'một phần độ chính xác – xem câu tiếp theo.'
      }
    },
    {
      kind: 'calc', ch: '2.1, 3.1', ans: 1,
      title: { en: 'The price at the ATM', vi: 'Cái giá ở ATM' },
      q: {
        en: 'VietBank\'s ATMs use the Polar transform. At FAR = 0.1%, GAR drops from 97% (unprotected) to 89% (Polar). Out of 1,000 genuine withdrawals, how many <b>more</b> customers are rejected?',
        vi: 'ATM của VietBank dùng biến đổi Polar. Tại FAR = 0,1%, GAR giảm từ 97% (không bảo vệ) xuống 89% (Polar). Trong 1.000 lượt rút tiền hợp lệ, có <b>thêm</b> bao nhiêu khách hàng bị từ chối?'
      },
      opts: ['8', '80', '110', '890'],
      why: {
        en: 'Accuracy loss = 97% − 89% = 8 percentage points; 8% of 1,000 = <b>80</b>.',
        vi: 'Mất độ chính xác = 97% − 89% = 8 điểm phần trăm; 8% của 1.000 = <b>80</b>.'
      }
    },
    {
      kind: 'scen', ch: '3.2', ans: 1,
      title: { en: 'Iris card that releases a key', vi: 'Thẻ mống mắt giải phóng khoá' },
      q: {
        en: 'Premium customers get an iris-based card. Iris templates are fixed-length bit strings (IrisCode), and a correct scan must release a key that unlocks the card. Which scheme?',
        vi: 'Khách hàng cao cấp được cấp thẻ dùng mống mắt. Template mống mắt là chuỗi bit độ dài cố định (IrisCode), và một lần quét đúng phải giải phóng khoá để mở thẻ. Chọn phương pháp nào?'
      },
      opts: [
        { en: 'Polar transform', vi: 'Biến đổi Polar' },
        'Fuzzy Commitment',
        'Fuzzy Vault',
        { en: 'Homomorphic encryption', vi: 'Mã hoá đồng hình' }
      ],
      gain: {
        en: 'very simple (XOR + error-correcting code + hash) and releases a key – the classic IrisCode use case.',
        vi: 'rất đơn giản (XOR + mã sửa lỗi + hash) và giải phóng được khoá – ứng dụng kinh điển với IrisCode.'
      },
      give: {
        en: 'only fixed-length bit strings; no built-in unlinkability.',
        vi: 'chỉ dùng cho chuỗi bit độ dài cố định; không có sẵn tính không liên kết.'
      }
    },
    {
      kind: 'calc', ch: '3.2', ans: 1,
      title: { en: 'Unlocking the iris card', vi: 'Mở khoá thẻ mống mắt' },
      q: {
        en: 'The card uses a ×3 repetition code and stores <span class="data">x ⊕ c = 110 101</span>. At the ATM, the customer\'s scan gives <span class="data">x′ = 111 010</span>. Which key does the card recover?',
        vi: 'Thẻ dùng mã lặp ×3 và lưu <span class="data">x ⊕ c = 110 101</span>. Tại ATM, lần quét của khách hàng cho <span class="data">x′ = 111 010</span>. Thẻ khôi phục được khoá nào?'
      },
      opts: ['00', '01', '10', '11'],
      why: {
        en: 'x′ ⊕ 110 101 = <span class="mono">001 111</span> → majority per 3-bit block → 0, 1 → key <b>01</b>. The flipped bit in the first block is corrected.',
        vi: 'x′ ⊕ 110 101 = <span class="mono">001 111</span> → lấy đa số theo từng khối 3 bit → 0, 1 → khoá <b>01</b>. Bit bị lật ở khối đầu đã được sửa.'
      }
    },
    {
      kind: 'calc', ch: '3.2', ans: 1,
      title: { en: 'Unlocking the fingerprint vault', vi: 'Mở khoá vault vân tay' },
      q: {
        en: 'The ATM vault uses a degree-1 polynomial p(x) = ax + b; the key is (a, b). The vault also stores a <b>check value</b> of the key (in practice a hash or CRC; here a toy check: <b>a × b = 3</b>).<br>Vault points: <span class="data">(1, 4) (2, 9) (3, 10) (4, 13) (5, 16) (6, 2) (7, 5)</span><br>The customer\'s query selects the points at x = 1, 5 and 6. Which key passes the check?',
        vi: 'Vault ở ATM dùng đa thức bậc 1 p(x) = ax + b; khoá là (a, b). Vault còn lưu một <b>giá trị kiểm tra</b> của khoá (thực tế là hash hoặc CRC; ở đây là phép kiểm tra đồ chơi: <b>a × b = 3</b>).<br>Các điểm trong vault: <span class="data">(1, 4) (2, 9) (3, 10) (4, 13) (5, 16) (6, 2) (7, 5)</span><br>Truy vấn của khách hàng chọn các điểm tại x = 1, 5 và 6. Khoá nào vượt qua phép kiểm tra?'
      },
      opts: ['(−14, 86)', '(3, 1)', '(2, 3)', { en: 'None – the customer is rejected', vi: 'Không có – khách hàng bị từ chối' }],
      why: {
        en: 'Each pair of selected points gives a candidate line: (1, 4) &amp; (5, 16) → 3x + 1 → a × b = 3 ✓; (5, 16) &amp; (6, 2) → −14x + 86 ✗; (1, 4) &amp; (6, 2) → −0.4x + 4.4 ✗. The point (6, 2) was chaff.',
        vi: 'Mỗi cặp điểm được chọn cho một đường ứng viên: (1, 4) &amp; (5, 16) → 3x + 1 → a × b = 3 ✓; (5, 16) &amp; (6, 2) → −14x + 86 ✗; (1, 4) &amp; (6, 2) → −0.4x + 4.4 ✗. Điểm (6, 2) là chaff.'
      },
      fig: () => (window.G3Fig ? window.G3Fig.vaultMini() : '')
    },
    {
      kind: 'scen', ch: '3.2', ans: 1,
      title: { en: 'Sharing with a partner insurer', vi: 'Chia sẻ với công ty bảo hiểm đối tác' },
      q: {
        en: 'Manulife Vietnam will build its own fingerprint vault for the same customers. The two vaults must not be linkable, and the key release must be kept. Which design?',
        vi: 'Manulife Vietnam sẽ xây vault vân tay riêng cho cùng tập khách hàng. Hai vault không được liên kết với nhau, và vẫn phải giữ khả năng giải phóng khoá. Chọn thiết kế nào?'
      },
      opts: [
        { en: 'Plain Fuzzy Vault at both sites', vi: 'Fuzzy Vault thuần ở cả hai nơi' },
        { en: 'Password hardening: salt the minutiae per application, then build and encrypt the vault', vi: 'Làm cứng bằng mật khẩu: salt minutiae theo từng ứng dụng, rồi xây và mã hoá vault' },
        { en: 'Fuzzy Commitment on minutiae', vi: 'Fuzzy Commitment trên minutiae' },
        { en: 'Unprotected templates with access control', vi: 'Template không bảo vệ + kiểm soát truy cập' }
      ],
      why: {
        en: 'In a plain vault the key only changes the y-values; the x-values of genuine points are the minutiae themselves, so they appear in both vaults while chaff does not (record multiplicity).',
        vi: 'Trong vault thuần, khoá chỉ đổi giá trị y; giá trị x của điểm thật chính là minutiae nên xuất hiện ở cả hai vault, còn chaff thì không (record multiplicity).'
      },
      gain: {
        en: 'unlinkability and renewability, plus protection against stolen-key and substitution attacks.',
        vi: 'không liên kết và thu hồi được, chống cả tấn công lộ khoá lẫn thay thế điểm.'
      },
      give: {
        en: 'customers must remember a password again.',
        vi: 'khách hàng lại phải nhớ mật khẩu.'
      }
    },
    {
      kind: 'scen', ch: '3.2', ans: 1,
      title: { en: 'No key stored anywhere', vi: 'Không lưu khoá ở đâu cả' },
      q: {
        en: 'VietBank wants to encrypt each customer\'s private documents with a key that is <b>never stored</b>, only rebuilt from the fingerprint when needed. Which scheme?',
        vi: 'VietBank muốn mã hoá tài liệu riêng của mỗi khách hàng bằng một khoá <b>không bao giờ được lưu</b>, chỉ dựng lại từ vân tay khi cần. Chọn phương pháp nào?'
      },
      opts: ['Fuzzy Vault', 'Fuzzy Extractor', 'BioHashing', { en: 'Homomorphic encryption', vi: 'Mã hoá đồng hình' }],
      gain: {
        en: 'the key is derived from the biometric itself; the helper data is safe to publish.',
        vi: 'khoá sinh ra từ chính dữ liệu sinh trắc; helper data công khai vẫn an toàn.'
      },
      give: {
        en: 'stability vs. entropy – if scans vary too much, customers cannot decrypt their own documents.',
        vi: 'ổn định vs. entropy – nếu các lần quét khác nhau quá nhiều, khách hàng không giải mã được tài liệu của chính mình.'
      }
    },
    {
      kind: 'calc', ch: '3.2', ans: 1,
      title: { en: 'Rebuilding the template', vi: 'Dựng lại template' },
      q: {
        en: 'The fuzzy extractor uses a ×3 repetition code. The public helper data is <span class="data">P = 011 100</span>. The customer\'s new scan is <span class="data">w′ = 011 001</span>. Which template w does Rep rebuild (and from it the same key R)?',
        vi: 'Fuzzy extractor dùng mã lặp ×3. Helper data công khai là <span class="data">P = 011 100</span>. Lần quét mới của khách hàng là <span class="data">w′ = 011 001</span>. Rep dựng lại template w nào (và từ đó ra cùng khoá R)?'
      },
      opts: ['011 001', '011 011', '000 111', '011 100'],
      why: {
        en: 'w′ ⊕ P = <span class="mono">000 101</span> → majority per block → 0, 1 → codeword c = <span class="mono">000 111</span> → w = P ⊕ c = <b>011 011</b>. R is then computed from w exactly as at enrolment.',
        vi: 'w′ ⊕ P = <span class="mono">000 101</span> → đa số theo từng khối → 0, 1 → từ mã c = <span class="mono">000 111</span> → w = P ⊕ c = <b>011 011</b>. Sau đó R được tính từ w y hệt lúc đăng ký.'
      }
    },
    {
      kind: 'scen', ch: '3.3', ans: 2,
      title: { en: 'Untrusted cloud', vi: 'Đám mây không tin cậy' },
      q: {
        en: 'Face matching will be outsourced to a cloud provider VietBank does not fully trust. The cloud must never see any face template. Which scheme?',
        vi: 'Việc so khớp khuôn mặt sẽ thuê ngoài cho một nhà cung cấp cloud mà VietBank không hoàn toàn tin tưởng. Cloud không bao giờ được thấy bất kỳ template khuôn mặt nào. Chọn phương pháp nào?'
      },
      opts: ['BioHashing', 'Fuzzy Commitment', { en: 'Homomorphic encryption', vi: 'Mã hoá đồng hình' }, { en: 'Polar transform', vi: 'Biến đổi Polar' }],
      gain: {
        en: 'matching happens directly on ciphertexts.',
        vi: 'so khớp diễn ra trực tiếp trên bản mã.'
      },
      give: {
        en: 'heavy computation and storage cost; whoever holds the decryption key can recover the templates.',
        vi: 'tốn nhiều tính toán và lưu trữ; ai giữ khoá giải mã thì khôi phục được template.'
      }
    },
    {
      kind: 'calc', ch: '3.3', ans: 1,
      title: { en: 'Computing on ciphertexts', vi: 'Tính toán trên bản mã' },
      q: {
        en: 'VietBank uses a multiplicatively homomorphic scheme (toy RSA). The cloud holds Enc(3) and Enc(4), multiplies the two ciphertexts and returns the result. What does VietBank get after decrypting it?',
        vi: 'VietBank dùng lược đồ đồng hình với phép nhân (RSA đồ chơi). Cloud giữ Enc(3) và Enc(4), nhân hai bản mã rồi trả kết quả. VietBank nhận được gì sau khi giải mã?'
      },
      opts: ['7', '12', '34', { en: 'Nothing – the cloud must decrypt first', vi: 'Không gì cả – cloud phải giải mã trước' }],
      why: {
        en: 'Enc(3) · Enc(4) = Enc(3 × 4) = Enc(<b>12</b>). The cloud computes without ever seeing 3 or 4.',
        vi: 'Enc(3) · Enc(4) = Enc(3 × 4) = Enc(<b>12</b>). Cloud tính toán mà không bao giờ thấy 3 hay 4.'
      }
    },
    {
      kind: 'scen', ch: '3.4', ans: 2,
      title: { en: 'Final decision', vi: 'Quyết định cuối cùng' },
      q: {
        en: 'Given all the requirements above, what should VietBank conclude?',
        vi: 'Với tất cả các yêu cầu ở trên, VietBank nên rút ra kết luận gì?'
      },
      opts: [
        { en: 'Use homomorphic encryption everywhere', vi: 'Dùng mã hoá đồng hình ở mọi nơi' },
        { en: 'Use BioHashing everywhere', vi: 'Dùng BioHashing ở mọi nơi' },
        { en: 'Different channels need different schemes (or hybrids) – no scheme is best for every requirement', vi: 'Mỗi kênh cần một phương pháp khác nhau (hoặc lai) – không có phương pháp nào tốt nhất cho mọi yêu cầu' },
        { en: 'Protection is unnecessary if the server is secure', vi: 'Không cần bảo vệ nếu máy chủ an toàn' }
      ],
      why: {
        en: 'The right choice depends on who can hold a secret, how much accuracy can be lost, whether a key must be released, and where matching happens.',
        vi: 'Lựa chọn đúng phụ thuộc vào ai có thể giữ bí mật, chấp nhận mất bao nhiêu độ chính xác, có cần giải phóng khoá không, và so khớp diễn ra ở đâu.'
      }
    }
  ];

  const ICON_OK = '<svg class="ic ok" viewBox="0 0 30 30" aria-hidden="true"><path d="M7 15.5l5.5 5.5L23.5 9"/></svg>';
  const ICON_NO = '<svg class="ic no" viewBox="0 0 30 30" aria-hidden="true"><path d="M9.5 9.5l11 11M20.5 9.5l-11 11"/></svg>';

  function render(q, i) {
    const s = document.createElement('section');
    const t = q.kind === 'calc' ? 35 : 20;
    s.className = 'slide quiz-q';
    s.id = 'q' + (i + 1);
    s.dataset.ch = 'q';
    s.dataset.ans = q.ans;
    s.dataset.t = t;
    s.dataset.tocEn = `Q${i + 1} · ${q.title.en}`;
    s.dataset.tocVi = `Câu ${i + 1} · ${q.title.vi}`;

    const rows = [`<div class="row" style="--i:0"><span class="chip good">✓ ${LET[q.ans]}</span><span><b>${L(q.opts[q.ans])}</b></span></div>`];
    let k = 1;
    if (q.why) rows.push(`<div class="row" style="--i:${k++}"><span class="chip">${L({ en: 'Why', vi: 'Vì sao' })}</span><span>${L(q.why)}</span></div>`);
    if (q.gain) rows.push(`<div class="row" style="--i:${k++}"><span class="chip good">${L({ en: 'Gain', vi: 'Được' })}</span><span>${L(q.gain)}</span></div>`);
    if (q.give) rows.push(`<div class="row" style="--i:${k++}"><span class="chip warn">${L({ en: 'Give up', vi: 'Đánh đổi' })}</span><span>${L(q.give)}</span></div>`);
    const fig = q.fig ? q.fig() : '';

    s.innerHTML = `
      <div class="q-head">
        <div>
          <div class="q-tags">
            <span class="q-no">${L({ en: 'Q', vi: 'Câu ' })}${i + 1}<span style="opacity:.65">/${QUIZ.length}</span></span>
            <span class="chip ${q.kind === 'calc' ? 'warn' : 'ch'}">${L(KIND[q.kind])}</span>
            <span class="chip">${L({ en: 'Ch.', vi: 'Mục' })}&nbsp;${q.ch}</span>
          </div>
          <h2>${L(q.title)}</h2>
        </div>
        <div class="timer" aria-hidden="true">
          <svg viewBox="0 0 62 62"><circle class="track" cx="31" cy="31" r="26"/><circle class="bar" cx="31" cy="31" r="26"/></svg>
          <div class="tn">${t}</div>
        </div>
      </div>
      <div class="q-body">
        <p class="q-text">${L(q.q)}</p>
        <div class="opts" role="group">
          ${q.opts.map((o, j) => `<button type="button" class="opt" data-j="${j}" style="--d:${j * 70}ms"><span class="lt">${LET[j]}</span><span class="ot">${L(o)}</span>${ICON_OK}${ICON_NO}</button>`).join('')}
        </div>
        <div class="q-foot">
          <button type="button" class="reveal-btn">${L({ en: 'Reveal answer', vi: 'Hiện đáp án' })} <kbd>→</kbd></button>
          <div class="explain${fig ? ' has-fig' : ''}" aria-live="polite">
            <div class="stack-s">${rows.join('')}</div>
            ${fig ? `<div class="efig">${fig}</div>` : ''}
          </div>
        </div>
      </div>`;
    return s;
  }

  /* ---------- state ---------- */
  const results = {};
  let timer = null;

  function stopTimer() {
    if (!timer) return;
    clearInterval(timer.id);
    timer.el.classList.remove('run', 'late');
    timer = null;
  }
  function startTimer(s) {
    stopTimer();
    if (s.classList.contains('revealed') || document.documentElement.classList.contains('doc-mode')) return;
    const el = s.querySelector('.timer');
    const tn = el.querySelector('.tn');
    let left = +s.dataset.t;
    el.classList.remove('run', 'late');
    void el.offsetWidth; // restart the CSS animation
    el.style.setProperty('--t', left + 's');
    el.classList.add('run');
    tn.textContent = left;
    const id = setInterval(() => {
      left -= 1;
      tn.textContent = Math.max(0, left);
      if (left <= 0) { el.classList.add('late'); clearInterval(id); }
    }, 1000);
    timer = { id, el };
  }

  function pick(s, j) {
    if (!s || s.classList.contains('revealed')) return;
    const opts = s.querySelectorAll('.opt');
    const o = opts[j];
    if (!o) return;
    const was = o.classList.contains('picked');
    opts.forEach((x) => x.classList.remove('picked'));
    if (!was) o.classList.add('picked');
  }

  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function burst(el) {
    if (!el || reduced()) return;
    const slide = el.closest('.slide');
    const sr = slide.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const scale = sr.width / slide.offsetWidth || 1;
    const cx = (er.left - sr.left + er.width / 2) / scale;
    const cy = (er.top - sr.top + er.height / 2) / scale;
    const cs = getComputedStyle(slide);
    const colors = ['--good', '--cq', '--accent', '--fig-1', '--fig-2', '--fig-4'].map((v) => cs.getPropertyValue(v).trim());
    for (let i = 0; i < 34; i++) {
      const p = document.createElement('i');
      p.className = 'spark';
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.background = colors[i % colors.length];
      if (i % 3 === 0) p.style.borderRadius = '50%';
      if (i % 4 === 1) { p.style.width = '5px'; p.style.height = '12px'; }
      slide.appendChild(p);
      const a = Math.random() * Math.PI * 2;
      const d = 110 + Math.random() * 230;
      const dx = Math.cos(a) * d;
      const dy = Math.sin(a) * d * 0.62 - 50;
      const anim = p.animate([
        { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx * 0.8}px), calc(-50% + ${dy * 0.8}px)) scale(1) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 90}px)) scale(.4) rotate(${Math.random() * 720}deg)`, opacity: 0 }
      ], { duration: 950 + Math.random() * 650, easing: 'cubic-bezier(.12,.75,.3,1)', fill: 'forwards' });
      anim.onfinish = () => p.remove();
    }
  }

  function reveal(s, opts = {}) {
    if (!s || s.classList.contains('revealed')) return;
    const ans = +s.dataset.ans;
    const list = s.querySelectorAll('.opt');
    list[ans].classList.add('correct');
    const picked = s.querySelector('.opt.picked');
    if (picked) {
      const ok = +picked.dataset.j === ans;
      if (!ok) picked.classList.add('wrong-pick');
      results[s.id] = ok;
    }
    s.classList.add('revealed');
    stopTimer();
    if (!opts.silent) setTimeout(() => burst(list[ans]), 380);
    updateScore();
  }

  function reset() {
    document.querySelectorAll('.quiz-q').forEach((s) => {
      s.classList.remove('revealed');
      s.querySelectorAll('.opt').forEach((o) => o.classList.remove('picked', 'correct', 'wrong-pick'));
    });
    Object.keys(results).forEach((k) => delete results[k]);
    updateScore();
  }

  function updateScore() {
    const box = document.getElementById('quiz-score');
    if (!box) return;
    const vals = Object.values(results);
    const n = vals.length;
    const ok = vals.filter(Boolean).length;
    box.classList.toggle('show', n > 0);
    box.innerHTML = `<span class="en">Your picks: <b>${ok} / ${n}</b> correct</span><span class="vi">Bạn chọn đúng: <b>${ok} / ${n}</b> câu</span>`;
  }

  /* ---------- mount ---------- */
  const intro = document.getElementById('quiz');
  if (intro) {
    let anchor = intro;
    QUIZ.forEach((q, i) => {
      const s = render(q, i);
      anchor.after(s);
      anchor = s;
    });
  }

  document.addEventListener('click', (e) => {
    const o = e.target.closest('.quiz-q .opt');
    if (o) { pick(o.closest('.slide'), +o.dataset.j); o.blur(); return; }
    const r = e.target.closest('.quiz-q .reveal-btn');
    if (r) { reveal(r.closest('.slide')); r.blur(); return; }
    if (e.target.closest('[data-quiz-reset]')) { reset(); e.target.closest('[data-quiz-reset]').blur(); }
  });

  document.addEventListener('slide:enter', (e) => {
    const s = e.detail.slide;
    if (s.classList.contains('quiz-q')) startTimer(s);
    else stopTimer();
  });

  const revealAll = () => document.querySelectorAll('.quiz-q').forEach((s) => reveal(s, { silent: true }));
  window.addEventListener('beforeprint', revealAll);
  if (new URLSearchParams(location.search).has('reveal')) revealAll();

  window.Quiz = { reveal, pick, reset, data: QUIZ };
})();

/* ---------- Kahoot join card on the quiz intro slide ----------
   PIN priority: ?pin=… in the URL › PIN typed with the ✎ button (saved in this browser) › data-pin in index.html */
(function () {
  'use strict';
  const box = document.getElementById('kahoot');
  if (!box) return;
  const KEY = 'g3btp:kahoot-pin';
  const DEFAULT = box.dataset.pin;
  const qrBox = box.querySelector('.kh-qr');
  const staticQr = qrBox.innerHTML;
  const joinUrl = (pin) => `https://kahoot.it/?pin=${pin}&refer_method=link`;
  const pretty = (pin) => pin.replace(/^(\d{3})(\d{3,4})$/, '$1 $2');
  const clean = (v) => String(v || '').replace(/\D/g, '');
  const valid = (pin) => /^\d{6,8}$/.test(pin);
  const load = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const save = (pin) => { try { pin === DEFAULT ? localStorage.removeItem(KEY) : localStorage.setItem(KEY, pin); } catch (e) { /* storage unavailable */ } };

  function render(pin) {
    box.querySelector('.kh-pin').textContent = pretty(pin);
    box.querySelector('.kh-pin').classList.toggle('long', pin.length > 6);
    box.querySelector('.kh-url').href = joinUrl(pin);
    if (pin === DEFAULT || typeof window.qrcode !== 'function') { qrBox.innerHTML = staticQr; return; }
    const qr = window.qrcode(0, 'M');
    qr.addData(joinUrl(pin));
    qr.make();
    qrBox.innerHTML = qr.createSvgTag({ cellSize: 1, margin: 2, scalable: true });
  }

  const fromUrl = clean(new URLSearchParams(location.search).get('pin'));
  let pin = valid(fromUrl) ? fromUrl : (valid(clean(load())) ? clean(load()) : DEFAULT);
  render(pin);

  box.querySelector('.kh-edit').addEventListener('click', (e) => {
    e.preventDefault();
    const lang = document.documentElement.lang;
    const v = window.prompt(lang === 'vi' ? 'Nhập mã PIN Kahoot mới (để trống để quay về mã gốc):' : 'New Kahoot PIN (leave empty to restore the original):', pin);
    if (v === null) return;
    const next = clean(v) || DEFAULT;
    if (!valid(next)) return;
    pin = next;
    save(pin);
    render(pin);
    e.currentTarget.blur();
  });
})();
