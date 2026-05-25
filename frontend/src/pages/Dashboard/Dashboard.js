import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if(userData) {
            setUser(JSON.parse(userData))
        }
    }, [])

    const getBMIStatus = (bmi) => {
        if(bmi < 18.5) return { status: 'Underweight', color: '#2196F3' }
        if(bmi < 25) return { status: 'Normal', color: '#4CAF50' }
        if(bmi < 30) return { status: 'Overweight', color: '#FF9800' }
        return { status: 'Obese', color: '#F44336' }
    }

    const getYogaTime = (bmi) => {
        if(bmi < 18.5) return 20
        if(bmi < 25) return 30
        if(bmi < 30) return 45
        return 60
    }

    const getSuggestedPoses = (bmi) => {
        if(bmi < 18.5) return ['Cobra', 'Mountain', 'Tree']
        if(bmi < 25) return ['Tree', 'Warrior', 'Triangle']
        if(bmi < 30) return ['Warrior', 'Chair', 'Dog']
        return ['Mountain', 'Chair', 'Warrior2']
    }

    const getDietChart = (bmi) => {
        if(bmi < 18.5) return {
            breakfast: [
                '2 Whole Eggs',
                'Whole Wheat Bread (2 slices)',
                'Peanut Butter',
                'Banana',
                'Full Fat Milk (1 glass)'
            ],
            lunch: [
                'Rice (1 cup)',
                'Dal/Lentils',
                'Chicken/Paneer',
                'Mixed Vegetables',
                'Curd/Yogurt'
            ],
            dinner: [
                'Chapati (3-4)',
                'Sabzi/Curry',
                'Protein (Eggs/Chicken/Dal)',
                'Salad'
            ],
            avoid: [
                '❌ Junk Food',
                '❌ Skipping Meals',
                '❌ Cold Drinks',
                '❌ Excessive Tea/Coffee',
                '❌ Processed Food'
            ]
        }
        if(bmi < 25) return {
            breakfast: [
                'Oats/Poha',
                '1-2 Eggs',
                'Fresh Fruits',
                'Green Tea/Milk'
            ],
            lunch: [
                'Brown Rice/Chapati',
                'Dal',
                'Mixed Vegetables',
                'Salad'
            ],
            dinner: [
                'Chapati (2)',
                'Light Sabzi',
                'Soup',
                'Salad'
            ],
            avoid: [
                '❌ Overeating',
                '❌ Late Night Eating',
                '❌ Excess Sugar',
                '❌ Alcohol',
                '❌ Processed Food'
            ]
        }
        if(bmi < 30) return {
            breakfast: [
                'Oats with Water',
                '1 Boiled Egg',
                'Green Tea (no sugar)',
                'Apple/Orange'
            ],
            lunch: [
                'Brown Rice (small portion)',
                'Dal (less oil)',
                'Steamed Vegetables',
                'Buttermilk'
            ],
            dinner: [
                'Chapati (1-2)',
                'Light Vegetable Curry',
                'Salad',
                'Soup'
            ],
            avoid: [
                '❌ Fried Foods',
                '❌ White Rice (excess)',
                '❌ Sugar & Sweets',
                '❌ Cold Drinks/Soda',
                '❌ Butter & Ghee (excess)',
                '❌ Junk Food'
            ]
        }
        return {
            breakfast: [
                'Vegetable Upma',
                'Green Tea (no sugar)',
                '1 Boiled Egg',
                'Cucumber/Carrot'
            ],
            lunch: [
                'Small Rice Portion',
                'Dal (no oil)',
                'Steamed Vegetables',
                'Salad'
            ],
            dinner: [
                '1 Chapati',
                'Vegetable Soup',
                'Salad',
                'Buttermilk'
            ],
            avoid: [
                '❌ Rice (completely)',
                '❌ Fried Foods',
                '❌ Sugar & Sweets',
                '❌ Cold Drinks/Soda',
                '❌ Butter & Ghee',
                '❌ Junk Food',
                '❌ Red Meat',
                '❌ White Bread'
            ]
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
    }

    if(!user) return <div>Loading...</div>

    const bmiInfo = getBMIStatus(user.bmi)
    const diet = getDietChart(user.bmi)

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>🧘 Welcome, {user.name}!</h2>
                <button onClick={handleLogout}
                    className="logout-btn">
                    Logout
                </button>
            </div>

            <div className="dashboard-cards">
                {/* BMI Card */}
                <div className="card">
                    <h3>📊 BMI Status</h3>
                    <div className="bmi-circle"
                        style={{borderColor: bmiInfo.color}}>
                        <h2 style={{color: bmiInfo.color}}>
                            {user.bmi}
                        </h2>
                        <p style={{color: bmiInfo.color}}>
                            {bmiInfo.status}
                        </p>
                    </div>
                    <p>Height: {user.height} m</p>
                    <p>Weight: {user.weight} kg</p>
                </div>

                {/* Yoga Time Card */}
                <div className="card">
                    <h3>⏱️ Daily Yoga Time</h3>
                    <div className="time-circle">
                        <h2>{getYogaTime(user.bmi)}</h2>
                        <p>minutes/day</p>
                    </div>
                    <p>Based on your BMI status</p>
                </div>

                {/* Suggested Poses Card */}
                <div className="card">
                    <h3>🧘 Suggested Poses</h3>
                    {getSuggestedPoses(user.bmi).map((pose, i) => (
                        <div key={i} className="pose-item">
                            ✅ {pose}
                        </div>
                    ))}
                </div>
            </div>

            {/* Diet Chart */}
            <div className="diet-container">
                <h3>🥗 Daily Diet Chart</h3>
                <p className="diet-subtitle">
                    Based on your BMI: {user.bmi}
                    ({bmiInfo.status})
                </p>
                <div className="diet-cards">

                    {/* Breakfast */}
                    <div className="meal-card">
                        <h4>🌅 Breakfast</h4>
                        {diet.breakfast.map((item, i) => (
                            <p key={i}>✅ {item}</p>
                        ))}
                    </div>

                    {/* Lunch */}
                    <div className="meal-card">
                        <h4>☀️ Lunch</h4>
                        {diet.lunch.map((item, i) => (
                            <p key={i}>✅ {item}</p>
                        ))}
                    </div>

                    {/* Dinner */}
                    <div className="meal-card">
                        <h4>🌙 Dinner</h4>
                        {diet.dinner.map((item, i) => (
                            <p key={i}>✅ {item}</p>
                        ))}
                    </div>

                    {/* Avoid Foods */}
                    <div className="meal-card avoid-card">
                        <h4>🚫 Foods To Avoid</h4>
                        {diet.avoid.map((item, i) => (
                            <p key={i}>{item}</p>
                        ))}
                    </div>

                </div>
            </div>

            <div className="dashboard-buttons">
                <button onClick={() => navigate('/start')}
                    className="start-btn">
                    Start Yoga Detection
                </button>
                <button onClick={() => navigate('/history')}
                    className="history-btn">
                    View History
                </button>
                <button onClick={() => navigate('/tutorials')}
                    className="tutorial-btn">
                    Tutorials
                </button>
            </div>
        </div>
    )
}

export default Dashboard