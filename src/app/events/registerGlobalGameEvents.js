import { GAME_CONFIG } from "../core/GameConfig.js";
import EventManager from "../../engine/utils/EventManager.js";
import { GAME_EVENTS } from "./GameEvents.js";

export function registerGlobalGameEvents() {
  const eventManager = EventManager.getInstance();

  const handleCtaPress = () => {
    window.location.href = GAME_CONFIG.ctaUrl;
  };

  eventManager.on(GAME_EVENTS.CTA_BUTTON_PRESSED, handleCtaPress);

  return () => {
    eventManager.off(GAME_EVENTS.CTA_BUTTON_PRESSED, handleCtaPress);
  };
}
