export function getStepContent(step) {
  switch (step) {
    case 0: return [{
      content: `<p><strong>Step 1: Environment Setup & Data Download</strong></p>
<p>Let's get your workspace ready. Here's what you need:</p>
<ol>
  <li><strong>Install Python 3.9+</strong> — I recommend the Anaconda distribution since it comes with Jupyter and most data libraries pre-installed</li>
  <li><strong>Create a project folder</strong> — something like <code>sleep-quality-analysis/</code></li>
  <li><strong>Install libraries</strong> if you don't have them:</li>
</ol>
<pre>pip install pandas numpy matplotlib seaborn scipy jupyter</pre>
<ol start="4">
  <li><strong>Download the dataset</strong> from <a href="https://www.kaggle.com/datasets/uom190346a/sleep-health-and-lifestyle-dataset" target="_blank" style="color: var(--accent);">Kaggle</a></li>
  <li><strong>Create your notebook</strong> — open Jupyter and create <code>sleep_analysis.ipynb</code></li>
</ol>
<p>Load the data to confirm everything works:</p>
<pre>import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv('Sleep_health_and_lifestyle_dataset.csv')
print(f"Dataset: {df.shape[0]} rows, {df.shape[1]} columns")
df.head()</pre>
<div class="tip-block"><strong>Tip:</strong> Create a README.md right now, even if it's empty. It'll remind you to document as you go — recruiters check this first.</div>`,
      actions: ["I'm set up, what's next?", "What if I don't have Anaconda?", "What does the data look like?"]
    }]

    case 1: return [{
      content: `<p><strong>Step 2: Data Cleaning & Preparation</strong></p>
<p>Before analyzing, we need to fix a few things in this dataset. Here's your checklist:</p>
<ol>
  <li><strong>Check for missing values:</strong></li>
</ol>
<pre>df.isnull().sum()</pre>
<p>The <code>Sleep Disorder</code> column has NaN values for people without a disorder. Fill them:</p>
<pre>df['Sleep Disorder'] = df['Sleep Disorder'].fillna('None')</pre>
<ol start="2">
  <li><strong>Split Blood Pressure</strong> into two usable numeric columns:</li>
</ol>
<pre>df[['Systolic_BP', 'Diastolic_BP']] = \\
    df['Blood Pressure'].str.split('/', expand=True).astype(int)</pre>
<ol start="3">
  <li><strong>Create useful derived columns:</strong></li>
</ol>
<pre># Sleep categories
df['Sleep_Category'] = pd.cut(df['Sleep Duration'],
    bins=[0, 6, 8, 12],
    labels=['Short (&lt;6h)', 'Normal (6-8h)', 'Long (&gt;8h)'])

# Age groups
df['Age_Group'] = pd.cut(df['Age'],
    bins=[0, 29, 39, 49, 59, 100],
    labels=['20s', '30s', '40s', '50s', '60+'])

# Activity flag
median_activity = df['Physical Activity Level'].median()
df['Active'] = df['Physical Activity Level'] >= median_activity</pre>
<ol start="4">
  <li><strong>Verify everything:</strong></li>
</ol>
<pre>df.info()
df.describe()</pre>`,
      actions: ["Done! Let's move to EDA", "Why split blood pressure?", "What other columns could I create?"]
    }]

    case 2: return [{
      content: `<p><strong>Step 3: Exploratory Data Analysis</strong></p>
<p>This is where the fun starts. We'll explore the data in three layers:</p>
<p><strong>Part A — Univariate (one variable at a time)</strong></p>
<p>Plot distributions to understand what's in the data:</p>
<pre># Numeric distributions
fig, axes = plt.subplots(2, 3, figsize=(15, 10))
for ax, col in zip(axes.flatten(),
    ['Sleep Duration', 'Quality of Sleep', 'Physical Activity Level',
     'Stress Level', 'Heart Rate', 'Daily Steps']):
    sns.histplot(df[col], ax=ax, kde=True, color='#3b6cf5')
    ax.set_title(col)
plt.tight_layout()
plt.show()</pre>
<pre># Categorical counts
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
for ax, col in zip(axes, ['Occupation', 'BMI Category', 'Sleep Disorder']):
    df[col].value_counts().plot(kind='barh', ax=ax, color='#3b6cf5')
    ax.set_title(col)
plt.tight_layout()
plt.show()</pre>
<p><strong>Part B — Bivariate (two variables)</strong></p>
<p>Start finding relationships:</p>
<pre># Correlation heatmap — this is your most important chart
plt.figure(figsize=(10, 8))
numeric_cols = df.select_dtypes(include=[np.number]).columns
sns.heatmap(df[numeric_cols].corr(), annot=True, cmap='RdBu_r',
            center=0, fmt='.2f', square=True)
plt.title('Correlation Heatmap')
plt.tight_layout()
plt.show()</pre>
<pre># Sleep quality by occupation
plt.figure(figsize=(12, 6))
order = df.groupby('Occupation')['Quality of Sleep'].mean().sort_values().index
sns.boxplot(data=df, y='Occupation', x='Quality of Sleep',
            order=order, palette='viridis')
plt.title('Sleep Quality by Occupation')
plt.show()</pre>
<div class="tip-block"><strong>Key rule:</strong> Under every chart, write ONE sentence explaining the insight. Don't just show charts — tell people what to see. This is what separates analysts from chart-makers.</div>`,
      actions: ["Show me Part C (Multivariate)", "What patterns should I look for?", "How do I make charts look better?"]
    }, {
      content: `<p><strong>Part C — Multivariate (multiple variables together)</strong></p>
<pre># Pair plot colored by sleep disorder
sns.pairplot(df[['Sleep Duration', 'Quality of Sleep',
    'Stress Level', 'Physical Activity Level',
    'Heart Rate', 'Sleep Disorder']],
    hue='Sleep Disorder', palette='Set2', corner=True)
plt.show()</pre>
<pre># Occupation profile table
profile = df.groupby('Occupation').agg({
    'Quality of Sleep': 'mean',
    'Stress Level': 'mean',
    'Physical Activity Level': 'mean',
    'Sleep Duration': 'mean'
}).round(2).sort_values('Quality of Sleep', ascending=False)
print(profile)</pre>
<pre># Sleep disorder rates by BMI
pd.crosstab(df['BMI Category'], df['Sleep Disorder'],
            normalize='index').round(3) * 100</pre>
<p>By the end of this step you should have <strong>10–15 annotated charts</strong> and a growing list of findings.</p>`,
      actions: ["Ready for deep-dive analysis", "Which charts are most important?", "I'm stuck on visualization"]
    }]

    case 3: return [{
      content: `<p><strong>Step 4: Deep-Dive Analysis</strong></p>
<p>Now we answer the project's core questions with evidence. There are four analyses to complete:</p>
<p><strong>Analysis 1: What Predicts Sleep Quality?</strong></p>
<pre># Rank correlations with sleep quality
correlations = df.select_dtypes(include=[np.number]).corr()['Quality of Sleep']
correlations = correlations.drop('Quality of Sleep').sort_values()
print(correlations)

# Visualize top predictors
fig, axes = plt.subplots(1, 3, figsize=(16, 5))
top_predictors = correlations.abs().nlargest(3).index.tolist()
for ax, pred in zip(axes, top_predictors):
    sns.regplot(data=df, x=pred, y='Quality of Sleep', ax=ax,
                scatter_kws={'alpha': 0.5}, color='#3b6cf5')
plt.tight_layout()
plt.show()</pre>
<p>Write a finding like: <em>"Stress level has the strongest negative correlation with sleep quality (r = -0.XX), followed by..."</em></p>
<p><strong>Analysis 2: Sleep Disorder Profiling</strong></p>
<pre># Compare profiles across disorder groups
profile = df.groupby('Sleep Disorder').agg({
    'Sleep Duration': 'mean',
    'Quality of Sleep': 'mean',
    'Physical Activity Level': 'mean',
    'Stress Level': 'mean',
    'Heart Rate': 'mean',
    'Daily Steps': 'mean',
    'Systolic_BP': 'mean',
    'Age': 'mean'
}).round(2).T
print(profile)</pre>
<p>Ask: What makes insomnia different from sleep apnea? Are there age or gender patterns?</p>`,
      actions: ["Show me Analysis 3 & 4", "How do I write good findings?", "What's a Sleep Health Score?"]
    }, {
      content: `<p><strong>Analysis 3: Occupation Impact</strong></p>
<pre># Ranked occupations with sleep disorder rates
occ_summary = df.groupby('Occupation').agg(
    avg_quality=('Quality of Sleep', 'mean'),
    avg_stress=('Stress Level', 'mean'),
    avg_activity=('Physical Activity Level', 'mean'),
    disorder_rate=('Sleep Disorder', lambda x: (x != 'None').mean() * 100)
).round(2).sort_values('avg_quality', ascending=False)
print(occ_summary)</pre>
<p>Look for jobs that combine <strong>high stress + low activity</strong> — those are your risk profiles.</p>
<p><strong>Analysis 4: Threshold Effects</strong></p>
<pre># Is there a stress tipping point?
stress_quality = df.groupby('Stress Level')['Quality of Sleep'].mean()
stress_quality.plot(kind='bar', color='#3b6cf5', figsize=(10, 5))
plt.title('Average Sleep Quality by Stress Level')
plt.ylabel('Sleep Quality')
plt.show()</pre>
<p>Look for where the line drops sharply — that's your threshold. Do the same for physical activity minutes.</p>
<p><strong>Bonus: Build a Sleep Health Score</strong></p>
<pre># Composite score (normalize and combine)
from sklearn.preprocessing import MinMaxScaler
scaler = MinMaxScaler()
score_cols = ['Sleep Duration', 'Quality of Sleep',
              'Physical Activity Level']
neg_cols = ['Stress Level']

df['Sleep_Health_Score'] = (
    scaler.fit_transform(df[score_cols]).mean(axis=1) * 0.7 +
    (1 - scaler.fit_transform(df[neg_cols])).flatten() * 0.3
) * 100</pre>
<div class="tip-block"><strong>Interview gold:</strong> A custom metric like this is a great talking point. Interviewers will ask how you chose the weights — have an answer ready.</div>`,
      actions: ["Let's build the dashboard", "How do I present these findings?"]
    }]

    case 4: return [{
      content: `<p><strong>Step 5: Build the Dashboard</strong></p>
<p>Pick your tool based on your target roles:</p>
<ul>
  <li><strong>Tableau Public</strong> (free) — Best visual polish, publishable online, most impressive for non-technical roles</li>
  <li><strong>Power BI Desktop</strong> (free) — Great for Microsoft-heavy companies</li>
  <li><strong>Streamlit</strong> (Python) — Shows coding skills, best for technical analyst roles</li>
</ul>
<p><strong>Dashboard Layout:</strong></p>
<ul>
  <li><strong>Top Row — KPI Cards:</strong> Avg Sleep Duration, Avg Sleep Quality, % With Disorders, Avg Stress Level</li>
  <li><strong>Left Panel — Filters:</strong> Gender, Age Group, Occupation, BMI, Sleep Disorder</li>
  <li><strong>Center — Main Charts:</strong> Correlation heatmap, stress vs. quality scatter, occupation ranking</li>
  <li><strong>Right Panel — Breakdowns:</strong> Disorder distribution, BMI vs. disorder rates</li>
  <li><strong>Bottom — Key Insights:</strong> 3 text callouts with your top findings</li>
</ul>
<p>If using <strong>Streamlit</strong>, here's a starter:</p>
<pre>import streamlit as st
import pandas as pd
import plotly.express as px

st.set_page_config(page_title="Sleep Analysis", layout="wide")
df = pd.read_csv('cleaned_sleep_data.csv')

st.title("What Drives Sleep Quality?")

# Filters in sidebar
gender = st.sidebar.multiselect("Gender", df['Gender'].unique(), default=df['Gender'].unique())
filtered = df[df['Gender'].isin(gender)]

# KPIs
col1, col2, col3, col4 = st.columns(4)
col1.metric("Avg Sleep Duration", f"{filtered['Sleep Duration'].mean():.1f}h")
col2.metric("Avg Sleep Quality", f"{filtered['Quality of Sleep'].mean():.1f}/10")
col3.metric("% With Disorders", f"{(filtered['Sleep Disorder']!='None').mean()*100:.0f}%")
col4.metric("Avg Stress", f"{filtered['Stress Level'].mean():.1f}/10")</pre>
<div class="tip-block"><strong>Design tip:</strong> Less is more. 4–6 clean, well-labeled charts beat 15 cluttered ones. Every chart should answer one clear question.</div>`,
      actions: ["Dashboard done! Next step", "Tableau or Streamlit — which is better?", "How do I deploy Streamlit?"]
    }]

    case 5: return [{
      content: `<p><strong>Step 6: Write the Stakeholder Summary</strong></p>
<p>This is the piece that makes your project stand out. Frame it as a memo to a <strong>corporate wellness team</strong> or <strong>health insurer</strong>.</p>
<p><strong>Structure:</strong></p>
<ol>
  <li><strong>Executive Summary</strong> (2–3 sentences) — What you analyzed, the single biggest finding</li>
  <li><strong>Key Findings</strong> (3–5 bullets) — Each backed by a specific number</li>
  <li><strong>Recommendations</strong> (3–5 bullets) — Actionable next steps for the audience</li>
  <li><strong>Limitations & Next Steps</strong> (short paragraph) — Data is synthetic, sample is small, suggest real-world follow-up</li>
</ol>
<p><strong>Example opening:</strong></p>
<p><em>"After analyzing sleep and lifestyle data for 374 professionals across 11 occupations, we found that stress level is the single strongest predictor of poor sleep quality, outweighing physical activity and BMI. We recommend three targeted interventions..."</em></p>
<p><strong>Example finding:</strong></p>
<p><em>"Sales representatives report the lowest average sleep quality (5.8/10) combined with the highest stress levels (7.2/10), making them the highest-priority group for wellness intervention."</em></p>
<div class="tip-block"><strong>Why this matters so much:</strong> Most candidates can make charts. Very few can write a clear business recommendation. This memo is what hiring managers remember.</div>`,
      actions: ["Done! Let's polish everything", "Can you give me more example findings?", "What if I don't know who the audience is?"]
    }]

    case 6: return [{
      content: `<p><strong>Step 7: Polish & Publish</strong></p>
<p><strong>GitHub Repository Checklist:</strong></p>
<ul>
  <li>Clean notebook with markdown headers between sections</li>
  <li><code>README.md</code> with: project title, description, dataset link, key findings (with 1–2 chart screenshots), tools used, how to run it</li>
  <li><code>requirements.txt</code> listing all packages</li>
  <li><code>/data</code> folder with CSV (or download instructions)</li>
  <li><code>/visuals</code> folder with exported chart images</li>
  <li>Stakeholder memo as PDF or markdown</li>
  <li>Dashboard link (Tableau Public URL or Streamlit deploy)</li>
</ul>
<p><strong>Interview Prep — Be ready for these:</strong></p>
<ul>
  <li><strong>"Walk me through your process"</strong> — Describe each step from cleaning to findings</li>
  <li><strong>"Most surprising finding?"</strong> — Have one specific insight prepared</li>
  <li><strong>"What would you do differently?"</strong> — Real data, larger sample, longitudinal tracking</li>
  <li><strong>"How did you handle messy data?"</strong> — Blood pressure split, NaN handling, derived columns</li>
  <li><strong>"Why these visualizations?"</strong> — Each chart answers a specific question</li>
</ul>
<p><strong>Suggested 10-day timeline:</strong></p>
<ul>
  <li>Day 1 — Setup & download</li>
  <li>Day 2 — Data cleaning</li>
  <li>Days 3–4 — EDA</li>
  <li>Days 5–6 — Deep-dive analyses</li>
  <li>Day 7 — Dashboard</li>
  <li>Day 8 — Stakeholder memo</li>
  <li>Days 9–10 — Polish & publish</li>
</ul>
<p><strong>That's it! You now have a complete, portfolio-ready data analysis project.</strong> Remember: a finished project with clear insights beats an unfinished masterpiece every time. Ship it, then iterate.</p>`,
      actions: ["Start over from Step 1", "What other projects should I do next?", "Thanks!"]
    }]

    default: return [{ content: "<p>Something went wrong. Try clicking a step in the sidebar.</p>" }]
  }
}
