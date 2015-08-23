window.Input = (function() {
	var maxSpeed = 12,
		acceleration = 1,
		friction = 1,
		leftKey = Keyboard.Keys.LEFT,
		rightKey = Keyboard.Keys.RIGHT,
		jumpKey = Keyboard.Keys.Z,
		throwKey = Keyboard.Keys.X;
		doorKey = Keyboard.Keys.C;

	return {
		runSystem: function(model) {
			model.getEntities().filter(function(entity) {
				return entity.player;
			}).forEach(function(playerEntity) {
				
				// movement
				if(Keyboard.isKeyPressed(leftKey)) {
					playerEntity.dx = Math.max(playerEntity.dx - acceleration, -maxSpeed);
				}
				if(Keyboard.isKeyPressed(rightKey)) {
					playerEntity.dx = Math.min(playerEntity.dx + acceleration, maxSpeed);
				}
				if(Keyboard.isKeyPressed(rightKey) === Keyboard.isKeyPressed(leftKey)) {
					if(playerEntity.dx > 0) {
						playerEntity.dx = Math.max(0, playerEntity.dx - friction);
					} else {
						playerEntity.dx = Math.min(0, playerEntity.dx + friction);
					}
				}
				
				// turn
				if(Keyboard.isKeyPressed(leftKey)) {
					if(!Keyboard.isKeyPressed(rightKey)) {
						playerEntity.playerFacingRight = false;
					}
				} else if(Keyboard.isKeyPressed(rightKey)) {
					playerEntity.playerFacingRight = true;
				}

				// jump
				if(Keyboard.isKeyPressedSinceStartOfLastFrame(jumpKey)) {
					if(playerEntity.dy === 0 && playerEntity.landed) {
						playerEntity.dy = 20;
						playerEntity.landed = false;
					}
				}

				// throw
				if(Keyboard.isKeyPressedSinceStartOfLastFrame(throwKey)) {
					if(model.getEntities().filter(function(e) {return e.boomerang}).length === 0) {
						model.getEntities().push({
							x: playerEntity.x,
							y: playerEntity.y,
							width: 30,
							height: 30,
							color: "#FF7777",
							targetX: playerEntity.x + 500,
							targetY: playerEntity.y,

							destEntity: playerEntity,						
							boomerang: true,
							boomerangSpeed: 30,
							boomerangAngle: playerEntity.playerFacingRight ? 350 : 190,
							boomerangMode: "leaving",
							boomerangLife: 100
						});
					}
				}

				// use door
				if(Keyboard.isKeyPressedSinceStartOfLastFrame(doorKey)) {
					model.getEntities().filter(function(entity) {
						return entity.door;
					}).forEach(function(doorEntity) {
						if(Entity.overlapsEntity(playerEntity, doorEntity)) {
							model.loadRoom(doorEntity.doorDestination);
						}
					});
				}
			});
		}
	};
}());