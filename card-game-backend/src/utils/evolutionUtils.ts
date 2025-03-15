// utils/evolutionUtils.ts
import { gameStateStore } from "../store/gameStateStore";
import { findCardById } from "../data/card-registry";
import { GameState } from "../models/gameStateModel";
import { BoardCard } from "../models/cardModel";

/**
 * Checks if a card on the board can evolve and handles the evolution if conditions are met
 * @param gameId The ID of the game
 * @param cardId The ID of the card to check for evolution
 * @returns Boolean indicating if evolution occurred
 */
export function checkEvolution(gameId: string, cardId: number): boolean {
    const gameState = gameStateStore.getGame(gameId);
    if (!gameState) return false;
    
    // Find the card on the board
    const cardIndex = gameState.board.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return false;
    
    // Get the card data
    const cardData = findCardById(cardId);
    if (!cardData || !('evolution' in cardData) || !(cardData as any).evolution?.canEvolve) return false;
    
    // Check evolution conditions (this would be more complex in reality)----------------------------------------------******************
    const conditionsMet = checkEvolutionConditions(gameState, cardIndex, (cardData as any).evolution.evolutionConditions);
    
    if (conditionsMet) {
        // Get the evolved card
        const evolvedCardId = (cardData as any).evolution.evolvesToId;
        if (!evolvedCardId) return false;
        
        // Replace the card on the board with the evolved version
        const evolvedData = findCardById(evolvedCardId);
        if (!evolvedData) return false;
        
        // Update the board
        const updatedCard = {
            ...gameState.board[cardIndex],
            cardId: evolvedCardId,
            health: (evolvedData as BoardCard).health, // Update health to new max
            // Update other properties as needed
        };
        
        const updatedBoard = [...gameState.board];
        updatedBoard[cardIndex] = updatedCard;
        
        // Save the updated game state
        gameStateStore.updateGame(gameId, { board: updatedBoard });
        return true;
    }
    
    return false;
}

/**
 * Check if evolution conditions are met for a card
 * @param gameState Current game state
 * @param cardIndex Index of the card on the board
 * @param conditions Array of condition strings to check
 * @returns Boolean indicating if all conditions are met
 */
function checkEvolutionConditions(gameState: GameState, cardIndex: number, conditions: string[]): boolean {
    if (!conditions || conditions.length === 0) return false;
    
    const card = gameState.board[cardIndex];
    
    // This would be more sophisticated in a real implementation
    // For now, we'll just check some example conditions
    return conditions.every(condition => {
        if (condition.includes("Survive")) {
            // Example: Check if the card has been on the board for sufficient turns
            const turnsNeeded = parseInt(condition.match(/\d+/)?.[0] || "0");
            // Assuming cards track turns they've been on the board
            const turnsSurvived = gameState.turnNumber - (card as any).placedOnTurn || 0;
            return turnsSurvived >= turnsNeeded;
        }
        
        if (condition.includes("Defeat")) {
            // Example: Check if the card has defeated enough enemies
            const defeatsNeeded = parseInt(condition.match(/\d+/)?.[0] || "0");
            // Assuming cards track enemies defeated
            const enemiesDefeated = (card as any).defeatedCount || 0;
            return enemiesDefeated >= defeatsNeeded;
        }
        
        // Add more condition checks as needed
        
        return false; // Unknown condition
    });
}