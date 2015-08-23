window.Physics = (function() {
	function closestToValue(v, a, b) {
		return Math.abs(a - v) < Math.abs(b - v) ? a : b;
	};

	function getShortestDistBetweenAngles(a, b) {
		return Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
	};

	function gravity(model) {
		model.getEntities().filter(function(e) {
			return e.gravity && e.dy !== undefined;
		}).forEach(function(e) {
			e.dy--;
		});
	};

	function stepX(model) {
		model.getEntities().filter(function(entity) {
			return entity.x !== undefined && entity.y !== undefined && entity.dx !== undefined && entity.dy !== undefined;
		}).forEach(function(entity) {
			var distanceToNearestEntity,
				nearEdge,
				farEdge;
				distanceToNearestEntity = Infinity;
				nearEdge = (entity.dx > 0) ? Entity.getLeft : Entity.getRight;
			farEdge = (entity.dx > 0) ? Entity.getRight: Entity.getLeft;
				model.getEntities().filter(function(otherEntity) {
				var otherEntityOverlapsEntityZone,
					otherEntityInDirectionOfEntityMovement;
					otherEntityOverlapsEntityZone = Entity.getTop(entity) > Entity.getBottom(otherEntity) && Entity.getBottom(entity) < Entity.getTop(otherEntity);
				otherEntityInDirectionOfEntityMovement = (nearEdge(otherEntity) - entity.x) * (farEdge(entity) - entity.x) >= 0;
				return otherEntity !== entity && otherEntity.collidable && entity.collidable && otherEntityOverlapsEntityZone && otherEntityInDirectionOfEntityMovement;
			}).forEach(function(otherEntity) {
				var distanceToOtherEntity;
				distanceToOtherEntity = nearEdge(otherEntity) - farEdge(entity);
				distanceToNearestEntity = closestToValue(0, distanceToOtherEntity, distanceToNearestEntity);
			});
			entity.x += closestToValue(0, distanceToNearestEntity, entity.dx);
			if(entity.heldEntity !== undefined) {
				entity.heldEntity.x += closestToValue(0, distanceToNearestEntity, entity.dx);
			}
			if(Math.abs(distanceToNearestEntity) < Math.abs(entity.dx)) {
				entity.dx = 0;
			}
		});
	};

	function stepY(model) {
		model.getEntities().filter(function(entity) {
			return entity.x !== undefined && entity.y !== undefined && entity.dx !== undefined && entity.dy !== undefined;
		}).forEach(function(entity) {
			var distanceToNearestEntity,
				nearEdge,
				farEdge;

			distanceToNearestEntity = Infinity;

			nearEdge = (entity.dy > 0) ? Entity.getBottom : Entity.getTop;
			farEdge = (entity.dy > 0) ? Entity.getTop : Entity.getBottom;

			model.getEntities().filter(function(otherEntity) {
				var otherEntityOverlapsEntityZone,
					otherEntityInDirectionOfEntityMovement;

				otherEntityOverlapsEntityZone = Entity.getRight(entity) > Entity.getLeft(otherEntity) && Entity.getLeft(entity) < Entity.getRight(otherEntity);
				otherEntityInDirectionOfEntityMovement = (nearEdge(otherEntity) - entity.y) * (farEdge(entity) - entity.y) >= 0;
				return entity !== otherEntity && otherEntity.collidable && entity.collidable && otherEntityOverlapsEntityZone && otherEntityInDirectionOfEntityMovement;
			}).forEach(function(otherEntity) {
				var distanceToOtherEntity;
				
				distanceToOtherEntity = nearEdge(otherEntity) - farEdge(entity);
				distanceToNearestEntity = closestToValue(0, distanceToOtherEntity, distanceToNearestEntity);
			});
			entity.y += closestToValue(0, distanceToNearestEntity, entity.dy);
			if(entity.heldEntity !== undefined) {
				entity.heldEntity.y += closestToValue(0, distanceToNearestEntity, entity.dy);
			}
			if(Math.abs(distanceToNearestEntity) < Math.abs(entity.dy)) {
				entity.dy = 0;
				entity.landed = true;
			}
		});
	};

	function death(model) {
		model.getEntities().filter(function(e) {return e.player}).forEach(function(p) {
			if(p.y < 0) {
				model.restartLevel();
			}
		});
	};

	function boomerang(model) {
		model.getEntities().filter(function(e) {return e.boomerang}).forEach(function(b) {
			var vectorToPlayer,
				angleToPlayer,
				turnAmount = 2,
				maxReturnSpeed = 15,
				dy,
				distanceToNearestEntity,
				nearEdge,
				farEdge;

			b.boomerangLife--;
			if(b.boomerangLife <= 0) {
				model.getEntities().splice(model.getEntities().indexOf(b), 1);
				return;
			}

			vectorToPlayer = {
				x: b.x - b.destEntity.x,
				y: b.y - b.destEntity.y
			};

			xPositive = (vectorToPlayer.x > 0)

			angleToPlayer = ((xPositive * 180 + Math.atan(vectorToPlayer.y / vectorToPlayer.x) * 360 / (2 * Math.PI)) + 360) % 360

			if(b.boomerangMode === "leaving") {
				// step X
				/*
				if rang is moving right
					find closest left side within dx of rang
					if dist to closest left side < dx
						move dist to closest left side
						angle change
						move dx - dist to closest left side
						if impact angle is 'sharp'
							start returning-mode
					else
						move dx
				if rang is moving left
					find closest right side within dx of rang
					if dist to closest right side < dx
						move dist to closest right side
						angle change
						move dx - dist to closest right side
						if impact angle is 'sharp'
							start returning-mode
					else
						move dx
				*/
				b.x += b.boomerangSpeed * Math.cos(2 * Math.PI * b.boomerangAngle / 360);
				// step Y
				/*
				if rang is moving up
					find closest bottom side within dy of rang
					if dist to closest bottom side < dy
						move dist to closest bottom side
						angle change
						move dy - dist to closest bottom side
						if impact angle is 'sharp'
							start returning-mode
					else
						move dy
				if rang is moving down
					find closest top side within dy of rang
					if dist to closest top side < dy
						move dist to closest top side
						angle change
						move dy - dist to closest top side
						if impact angle is 'sharp'
							start returning-mode
					else
						move dy
				*/
				dy = b.boomerangSpeed * Math.sin(2 * Math.PI * b.boomerangAngle / 360);
				distanceToNearestEntity = Infinity;

				nearEdge = (dy > 0) ? Entity.getBottom : Entity.getTop;
				farEdge = (dy > 0) ? Entity.getTop : Entity.getBottom;

				model.getEntities().filter(function(otherEntity) {
					var otherEntityOverlapsEntityZone,
						otherEntityInDirectionOfEntityMovement;

					otherEntityOverlapsEntityZone = Entity.getRight(b) > Entity.getLeft(otherEntity) && Entity.getLeft(b) < Entity.getRight(otherEntity);
					otherEntityInDirectionOfEntityMovement = (nearEdge(otherEntity) - b.y) * (farEdge(b) - b.y) >= 0;
					return b !== otherEntity && otherEntity.collidable && otherEntityOverlapsEntityZone && otherEntityInDirectionOfEntityMovement;
				}).forEach(function(otherEntity) {
					var distanceToOtherEntity;
					
					distanceToOtherEntity = nearEdge(otherEntity) - farEdge(b);
					distanceToNearestEntity = closestToValue(0, distanceToOtherEntity, distanceToNearestEntity);
				});
				b.y += closestToValue(0, distanceToNearestEntity, dy);
				if(Math.abs(distanceToNearestEntity) < Math.abs(dy)) {
					// TODO: angle change
					b.y += dy - distanceToNearestEntity;
				}

















				b.boomerangSpeed = (b.boomerangSpeed - 1 + 360) % 360;

				if(b.boomerangSpeed <= 0) {
					b.boomerangMode = "returning";
					b.boomerangSpeed = 0;
					b.boomerangAngle = angleToPlayer;
				}
			} else if(b.boomerangMode === "returning") {
				if(Entity.overlapsEntity(b, b.destEntity)) {
					model.getEntities().splice(model.getEntities().indexOf(b), 1);
					return;
				}

				if(b.boomerangSpeed <= maxReturnSpeed) {
					b.boomerangSpeed++;
				}

				// turn towards player
				if(getShortestDistBetweenAngles(angleToPlayer, b.boomerangAngle) < turnAmount) {
					b.boomerangAngle = angleToPlayer;
				} else if(getShortestDistBetweenAngles(angleToPlayer, b.boomerangAngle + turnAmount) < getShortestDistBetweenAngles(angleToPlayer, b.boomerangAngle - turnAmount)) {
					b.boomerangAngle = (b.boomerangAngle + turnAmount + 360) % 360;
				} else {
					b.boomerangAngle = (b.boomerangAngle - turnAmount + 360) % 360;
				}
				

				b.x += b.boomerangSpeed * Math.cos(2 * Math.PI * b.boomerangAngle / 360);
				b.y += b.boomerangSpeed * Math.sin(2 * Math.PI * b.boomerangAngle / 360);
			}
		});
	};

	return {
		runSystem: function(model) {
			gravity(model);
			stepX(model);
			stepY(model);
			boomerang(model);
			death(model);
		}
	};
}());