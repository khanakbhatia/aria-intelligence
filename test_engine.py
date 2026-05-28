import asyncio
from app.core.aria_engine import aria_engine


async def test():

    result = await aria_engine.analyze(
        user_message="I'm honestly disappointed with your service.",
        customer_context={
            "name": "David",
            "plan": "Pro",
            "lifetime_value": 2400
        }
    )

    print(result)


asyncio.run(test())