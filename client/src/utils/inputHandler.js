export function processInput(text, currentStep, steps) {
  const lower = text.toLowerCase().trim()

  // Navigation commands
  if (lower === 'next' || lower.includes("what's next") || lower.includes("let's go") || lower.includes("let's start")) {
    return { type: 'navigate', step: Math.min(currentStep + 1, steps.length - 1) }
  }

  if (lower.includes("start over") || lower.includes("from step 1")) {
    return { type: 'navigate', step: 0 }
  }

  if (lower.includes("set up") || lower.includes("done")) {
    return { type: 'navigate', step: Math.min(currentStep + 1, steps.length - 1) }
  }

  // Quick action matched responses
  if (lower.includes("don't have anaconda") || lower.includes("without anaconda")) {
    return {
      type: 'response',
      content: `<p>No problem! You can use plain Python instead:</p>
<ol>
  <li>Install Python from <a href="https://python.org" target="_blank" style="color: var(--accent);">python.org</a></li>
  <li>Open your terminal and run:</li>
</ol>
<pre>pip install pandas numpy matplotlib seaborn scipy jupyter</pre>
<p>Then start Jupyter with:</p>
<pre>jupyter notebook</pre>
<p>Alternatively, you can use <strong>Google Colab</strong> (free, runs in browser, nothing to install). Go to <a href="https://colab.research.google.com" target="_blank" style="color: var(--accent);">colab.research.google.com</a>, upload the CSV, and you're ready to go.</p>`,
      actions: ["I'm set up, what's next?", "How do I upload to Colab?"]
    }
  }

  if (lower.includes("data look like") || lower.includes("what columns")) {
    return {
      type: 'response',
      content: `<p>The dataset has <strong>374 rows</strong> and <strong>13 columns</strong>:</p>
<ul>
  <li><strong>Person ID</strong> — Unique identifier</li>
  <li><strong>Gender</strong> — Male / Female</li>
  <li><strong>Age</strong> — Age in years</li>
  <li><strong>Occupation</strong> — 11 different job types (Engineer, Doctor, Nurse, Teacher, Salesperson, etc.)</li>
  <li><strong>Sleep Duration</strong> — Hours per night (continuous)</li>
  <li><strong>Quality of Sleep</strong> — Self-rated 1–10</li>
  <li><strong>Physical Activity Level</strong> — Minutes per day</li>
  <li><strong>Stress Level</strong> — Self-rated 1–10</li>
  <li><strong>BMI Category</strong> — Normal / Overweight / Obese</li>
  <li><strong>Blood Pressure</strong> — String like "130/85"</li>
  <li><strong>Heart Rate</strong> — Resting bpm</li>
  <li><strong>Daily Steps</strong> — Steps per day</li>
  <li><strong>Sleep Disorder</strong> — None / Insomnia / Sleep Apnea</li>
</ul>
<p>Note: This is a <strong>synthetic dataset</strong> — the data is simulated, not collected from real patients. That's fine for a portfolio project, just mention it in your write-up for transparency.</p>`,
      actions: ["I'm set up, what's next?"]
    }
  }

  if (lower.includes("why split blood pressure")) {
    return {
      type: 'response',
      content: `<p>Blood pressure comes as a string like <code>"130/85"</code> — you can't do math on strings. By splitting into <strong>Systolic_BP</strong> (top number, when heart beats) and <strong>Diastolic_BP</strong> (bottom number, between beats), you get two proper numeric columns you can correlate, plot, and include in analysis.</p>
<p>It also demonstrates a common real-world cleaning task. Interviewers love asking <em>"how did you handle messy data?"</em> — this is a concrete, easy-to-explain example.</p>`,
      actions: ["Done! Let's move to EDA", "What other columns could I create?"]
    }
  }

  if (lower.includes("other columns") || lower.includes("what else could i create")) {
    return {
      type: 'response',
      content: `<p>Some useful derived columns beyond what we covered:</p>
<ul>
  <li><strong>BP_Category</strong> — Classify as Normal/Elevated/High based on medical thresholds (Systolic &lt; 120 = Normal, 120-129 = Elevated, 130+ = High)</li>
  <li><strong>Sleep_Efficiency</strong> — Quality of Sleep / Sleep Duration (quality per hour)</li>
  <li><strong>Stress_Activity_Ratio</strong> — Stress Level / Physical Activity Level (higher = worse balance)</li>
  <li><strong>Is_Active_Enough</strong> — Physical Activity >= 30 min (WHO minimum recommendation)</li>
  <li><strong>Heart_Rate_Zone</strong> — Categorize resting HR as Low/Normal/Elevated</li>
</ul>
<p>Don't go overboard though — only create columns you'll actually use in analysis. Each one should help answer a question.</p>`,
      actions: ["Done! Let's move to EDA"]
    }
  }

  if (lower.includes("part c") || lower.includes("multivariate")) {
    return { type: 'navigate', step: 2 }
  }

  if (lower.includes("patterns should i look for")) {
    return {
      type: 'response',
      content: `<p>In EDA, train your eye for these patterns:</p>
<ul>
  <li><strong>Strong correlations</strong> — In the heatmap, anything above |0.5| is worth investigating. Stress vs. sleep quality is likely the strongest.</li>
  <li><strong>Group differences</strong> — Do certain occupations cluster together? Is the gap between Normal BMI and Obese meaningful?</li>
  <li><strong>Bimodal distributions</strong> — If sleep duration shows two peaks, there might be two distinct groups in the data</li>
  <li><strong>Outliers</strong> — Anyone sleeping 3 hours or 12 hours? What's their profile?</li>
  <li><strong>Interaction effects</strong> — Does physical activity matter more for high-stress people than low-stress people?</li>
</ul>
<p>Write down every interesting observation. You'll filter them later into your top findings.</p>`,
      actions: ["Show me Part C (Multivariate)", "Ready for deep-dive analysis"]
    }
  }

  if (lower.includes("charts look better") || lower.includes("visualization") || lower.includes("stuck on vis")) {
    return {
      type: 'response',
      content: `<p>A few quick wins to make your charts portfolio-ready:</p>
<pre># Set a clean global style
sns.set_theme(style='whitegrid', palette='muted')
plt.rcParams['figure.dpi'] = 120
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['axes.titlesize'] = 14
plt.rcParams['axes.titleweight'] = 'bold'</pre>
<ul>
  <li><strong>Always add titles and axis labels</strong> — every chart needs them</li>
  <li><strong>Use consistent colors</strong> — pick 3–4 colors and stick with them throughout</li>
  <li><strong>Remove chart clutter</strong> — use <code>sns.despine()</code> to remove top/right borders</li>
  <li><strong>Size matters</strong> — use <code>figsize=(12, 6)</code> for wide charts, <code>(8, 8)</code> for square ones</li>
  <li><strong>Annotate key points</strong> — use <code>plt.annotate()</code> to call out important values</li>
  <li><strong>Export high-res</strong> — <code>plt.savefig('chart.png', dpi=300, bbox_inches='tight')</code></li>
</ul>`,
      actions: ["Show me Part C (Multivariate)", "Ready for deep-dive analysis"]
    }
  }

  if (lower.includes("sleep health score")) {
    return {
      type: 'response',
      content: `<p>A <strong>Sleep Health Score</strong> is a composite metric you create by combining multiple factors into a single number. Here's how to build one:</p>
<pre>from sklearn.preprocessing import MinMaxScaler

scaler = MinMaxScaler()

# Positive factors (higher = better)
pos = scaler.fit_transform(df[['Sleep Duration', 'Quality of Sleep', 'Physical Activity Level']])

# Negative factors (higher = worse, so we invert)
neg = 1 - scaler.fit_transform(df[['Stress Level']])

# Combine with weights
df['Sleep_Health_Score'] = (pos.mean(axis=1) * 0.7 + neg.flatten() * 0.3) * 100</pre>
<p>You can then analyze who scores highest/lowest, which occupations rank best, and use it as your dashboard's headline metric.</p>
<p>In interviews, you'll be asked <em>"how did you choose the weights?"</em> A good answer: <em>"I weighted sleep metrics at 70% since they're the direct outcome, and stress at 30% as a contributing factor. In production, I'd validate these with domain experts."</em></p>`,
      actions: ["Let's build the dashboard", "Show me Analysis 3 & 4"]
    }
  }

  if (lower.includes("how do i write") || lower.includes("good findings")) {
    return {
      type: 'response',
      content: `<p>A strong finding has three parts: <strong>what</strong>, <strong>how much</strong>, and <strong>so what</strong>.</p>
<p><strong>Weak:</strong> <em>"Stress and sleep quality are correlated."</em></p>
<p><strong>Strong:</strong> <em>"Stress level has the strongest negative correlation with sleep quality (r = -0.73). Individuals with stress above 7/10 average only 5.9 hours of sleep compared to 7.6 hours for those below 4/10, suggesting stress management programs could meaningfully improve employee sleep."</em></p>
<p>The formula is:</p>
<ul>
  <li><strong>Specific claim</strong> with a number</li>
  <li><strong>Comparison</strong> that gives it context</li>
  <li><strong>Implication</strong> that makes it actionable</li>
</ul>`,
      actions: ["Let's build the dashboard", "Show me Analysis 3 & 4"]
    }
  }

  if (lower.includes("tableau or streamlit") || lower.includes("which is better")) {
    return {
      type: 'response',
      content: `<p>It depends on your target roles:</p>
<ul>
  <li><strong>Tableau Public</strong> — Best if you're targeting business analyst, marketing analyst, or product analyst roles. It's the industry standard, looks polished, and you can publish it publicly with a shareable link.</li>
  <li><strong>Streamlit</strong> — Best if targeting more technical roles (data analyst at a tech company, analytics engineer). It shows you can code a full application, and it deploys free on Streamlit Cloud.</li>
  <li><strong>Power BI</strong> — Best if targeting companies in the Microsoft ecosystem (enterprise, consulting, healthcare). Free desktop version is solid.</li>
</ul>
<p><strong>My suggestion:</strong> If in doubt, do Tableau. It takes less time and the visual output is more immediately impressive. You can always add a Streamlit version later.</p>`,
      actions: ["Dashboard done! Next step", "How do I deploy Streamlit?"]
    }
  }

  if (lower.includes("deploy streamlit")) {
    return {
      type: 'response',
      content: `<p>Deploying Streamlit is free and takes about 5 minutes:</p>
<ol>
  <li>Push your code to a <strong>GitHub repo</strong> with your <code>app.py</code>, <code>requirements.txt</code>, and the CSV</li>
  <li>Go to <a href="https://share.streamlit.io" target="_blank" style="color: var(--accent);">share.streamlit.io</a> and sign in with GitHub</li>
  <li>Click <strong>"New app"</strong>, select your repo, branch, and main file path</li>
  <li>Click <strong>"Deploy"</strong> — it'll build and give you a public URL</li>
</ol>
<p>Your <code>requirements.txt</code> should include:</p>
<pre>streamlit
pandas
plotly
seaborn
matplotlib</pre>
<p>That's it — you now have a live dashboard you can link in your resume.</p>`,
      actions: ["Dashboard done! Next step"]
    }
  }

  if (lower.includes("more example findings")) {
    return {
      type: 'response',
      content: `<p>Here are templates you can adapt with your actual numbers:</p>
<ul>
  <li><em>"Nurses and doctors report the highest average sleep quality (8.1/10 and 7.9/10 respectively), despite above-average stress levels, suggesting that high physical activity in these roles may offset stress effects."</em></li>
  <li><em>"78% of individuals with sleep apnea fall in the Overweight or Obese BMI category, compared to 34% of those without disorders — BMI screening could serve as an early warning indicator."</em></li>
  <li><em>"There is a clear stress threshold at level 7: average sleep quality drops from 7.2 to 5.4 between stress levels 6 and 8, indicating a non-linear tipping point rather than gradual decline."</em></li>
  <li><em>"Individuals averaging 60+ minutes of daily physical activity report 1.8 points higher sleep quality than those under 30 minutes, even after controlling for stress level."</em></li>
</ul>
<p>Replace the numbers with what your analysis actually shows — never fabricate data points.</p>`,
      actions: ["Done! Let's polish everything"]
    }
  }

  if (lower.includes("audience") || lower.includes("who am i writing for")) {
    return {
      type: 'response',
      content: `<p>Pick one of these and write to them:</p>
<ul>
  <li><strong>Corporate Wellness Team</strong> — They want to know which employees are at risk and what programs to fund. Focus on occupation-based findings and stress interventions.</li>
  <li><strong>Health Insurance Company</strong> — They care about which factors predict disorders (risk pricing). Focus on the sleep disorder profiling and BMI connections.</li>
  <li><strong>HR Department</strong> — They want to reduce absenteeism and improve productivity. Focus on sleep quality by role and the cost of poor sleep.</li>
</ul>
<p>The specific audience doesn't matter as much as having <em>one</em> audience. It forces you to make your insights actionable instead of abstract.</p>`,
      actions: ["Done! Let's polish everything"]
    }
  }

  if (lower.includes("other projects") || lower.includes("what else") || lower.includes("do next")) {
    return {
      type: 'response',
      content: `<p>Great question! For a strong portfolio, aim for 2–3 projects that show range. Now that you have this health/lifestyle project, consider:</p>
<ul>
  <li><strong>A SQL-heavy project</strong> — Use the Brazilian E-Commerce (Olist) dataset on Kaggle. Multiple tables that need joining, revenue analysis, customer segmentation. Shows you can work with relational data.</li>
  <li><strong>A real-time/API project</strong> — Pull job posting data or stock data via an API, analyze trends. Shows you can gather your own data.</li>
  <li><strong>An A/B testing project</strong> — Find a conversion dataset and run hypothesis tests. Shows statistical literacy.</li>
</ul>
<p>Each project should demonstrate a different skill. Together, your sleep project + a SQL project + an A/B testing project covers everything most analyst roles ask for.</p>`,
      actions: ["Start over from Step 1", "Thanks!"]
    }
  }

  if (lower.includes("thanks") || lower.includes("thank you")) {
    return {
      type: 'response',
      content: `<p>You're welcome! Good luck with the project. Remember the golden rule: <strong>ship it, then iterate.</strong> A complete project with clear insights is better than a perfect one that never gets finished.</p>
<p>If you need to revisit any step, just click it in the sidebar or type the step name. You've got this!</p>`,
      actions: null
    }
  }

  if (lower.includes("which charts") || lower.includes("most important")) {
    return {
      type: 'response',
      content: `<p>If you could only include 5 charts in your portfolio, make it these:</p>
<ol>
  <li><strong>Correlation heatmap</strong> — Shows you understand relationships between variables at a glance</li>
  <li><strong>Sleep Quality by Occupation (box plot)</strong> — Tells a story about real-world impact</li>
  <li><strong>Stress vs. Sleep Quality (scatter with regression)</strong> — Your strongest finding, visualized</li>
  <li><strong>Sleep Disorder profiles (grouped bar chart)</strong> — Shows how groups differ</li>
  <li><strong>Your dashboard screenshot</strong> — Proves you can build an interactive product</li>
</ol>
<p>Put the top 2 in your GitHub README as images. They're what recruiters see first.</p>`,
      actions: ["Ready for deep-dive analysis", "Show me Part C (Multivariate)"]
    }
  }

  // No match — delegate to Claude API
  return { type: 'api' }
}
