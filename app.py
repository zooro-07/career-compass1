import os
from flask import Flask, render_template, request, jsonify

app = Flask(__name__, static_folder='static', template_folder='templates')

COURSE_DATA = {
    "Artificial Intelligence": {"scope":95, "colleges":["IIT Bombay","IIT Madras","IIIT Hyderabad","BITS Pilani","IISc Bangalore"]},
    "Data Science": {"scope":90, "colleges":["IIT Kharagpur","IIT Delhi","IIIT Bangalore","BITS Pilani","IISc Bangalore"]},
    "Cyber Security": {"scope":80, "colleges":["IIT Bombay","IIIT Delhi","VIT Vellore","NIT Trichy","IISc Bangalore"]},
    "Web Development": {"scope":75, "colleges":["IIIT Hyderabad","VIT Vellore","SRM University","Amrita","NIT Calicut"]},
    "Design & UX": {"scope":70, "colleges":["NID Ahmedabad","NIFT Delhi","Srishti Institute","MIT Pune","IIITDM Kancheepuram"]}
}

def analyze_answers(answers):
    score = {k:0 for k in COURSE_DATA.keys()}
    mapping = {0:["Artificial Intelligence","Data Science"],1:["Web Development","Cyber Security"],2:["Design & UX"],3:["Artificial Intelligence","Data Science"],4:["Web Development","Design & UX"]}
    for i, ans in enumerate(answers):
        if not ans: continue
        opts = mapping.get(i, [])
        if ans.lower()=='a' and len(opts)>=1: score[opts[0]]+=2
        elif ans.lower()=='b' and len(opts)>=2: score[opts[1]]+=2
        elif ans.lower()=='c' and len(opts)>=1: score[opts[0]]+=1
    ranked = sorted(COURSE_DATA.keys(), key=lambda k: (score[k], COURSE_DATA[k]['scope']), reverse=True)
    top_course = ranked[0]
    return {"top_course": top_course, "ranked": [{"course": c, "score": score[c], "scope": COURSE_DATA[c]["scope"]} for c in ranked]}

@app.route('/')
def welcome():
    return render_template('welcome.html')

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

@app.route('/results', methods=['POST'])
def results():
    data = request.get_json() or {}
    answers = data.get('answers', [])
    analysis = analyze_answers(answers)
    return jsonify(analysis)

@app.route('/dashboard')
def dashboard():
    return render_template('results_page.html')

@app.route('/courses')
def courses():
    return jsonify([{"course": c, "scope": COURSE_DATA[c]["scope"]} for c in COURSE_DATA])

@app.route('/colleges/<course>')
def colleges(course):
    course = course.replace("%20"," ")
    info = COURSE_DATA.get(course)
    if not info: return jsonify({"colleges": []})
    return jsonify({"colleges": info["colleges"], "course": course})

@app.route('/roadmap_data/<course>')
def roadmap_data(course):
    course = course.replace("%20"," ")
    roadmaps = {
        "Artificial Intelligence":["Learn Python and math.","Study ML basics and projects.","Deep Learning & NLP.","Kaggle and open-source.","AI internships & research."],
        "Data Science":["Statistics & Python/R.","Data cleaning projects.","ML & visualization.","Portfolio & competitions.","Data internships."],
        "Cyber Security":["Networking & Linux.","Security fundamentals & crypto.","Practice on platforms.","Certifications & internships.","SOC/pen-testing roles."],
        "Web Development":["HTML/CSS/JS.","Full-stack apps & deploy.","Databases & APIs.","Real projects & freelance.","Jobs at startups/companies."],
        "Design & UX":["Design fundamentals.","Tools: Figma/Adobe.","Create case studies.","Intern at agencies.","Product/UX roles."]
    }
    return jsonify({"roadmap": roadmaps.get(course, ["Start exploring the field."])})

if __name__ == '__main__':
    port = int(os.environ.get('PORT',5000))
    app.run(host='0.0.0.0', port=port)
